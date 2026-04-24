import { prisma } from './prisma';
import { Contestant, ScoredContestant } from '@/types/contestant';
import { Prisma } from '@prisma/client';

/**
 * Database Query Layer
 * 
 * All database queries are centralized here.
 * The 'server-only' import ensures this code never runs in the browser.
 * 
 * Security: Database credentials never exposed to client.
 */

/**
 * Get all contestants for a series, sorted by display order
 * 
 * @param seriesId - The series ID to fetch contestants for
 * @returns Array of contestants with their metadata
 */
export async function getSeriesContestants(
  seriesId: number
): Promise<Contestant[]> {
  const contestants = await prisma.contestant.findMany({
    where: { seriesId },
    orderBy: { displayOrder: 'asc' },
  });

  return contestants.map(c => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    seriesId: c.seriesId,
  }));
}

async function getTaskIdForSeriesEpisodeTask(
  seriesId: number,
  episodeNumber: number,
  taskNumber: number
): Promise<number | null> {
  const episode = await prisma.episode.findUnique({
    where: {
      seriesId_number: {
        seriesId,
        number: episodeNumber,
      },
    },
    select: { id: true },
  });

  if (!episode) return null;

  const task = await prisma.task.findUnique({
    where: {
      episodeId_number: {
        episodeId: episode.id,
        number: taskNumber,
      },
    },
    select: { id: true },
  });

  return task?.id ?? null;
}

/**
 * Get official scores for a specific task
 * 
 * @param seriesId - The series ID
 * @param episodeNumber - The episode number within the series
 * @param taskNumber - The task number within the episode
 * @returns Array of contestants with their official scores
 */
export async function getOfficialScores(
  seriesId: number,
  episodeNumber: number,
  taskNumber: number
): Promise<ScoredContestant[]> {
  // First, find the episode
  const episode = await prisma.episode.findUnique({
    where: {
      seriesId_number: {
        seriesId,
        number: episodeNumber,
      },
    },
  });

  if (!episode) {
    // Episode not found - return default scores
    const contestants = await getSeriesContestants(seriesId);
    return contestants.map((c, index) => ({ ...c, points: 5 - index }));
  }

  // Now find the task with its official scores
  const task = await prisma.task.findUnique({
    where: {
      episodeId_number: {
        episodeId: episode.id,
        number: taskNumber,
      },
    },
    include: {
      officialScores: {
        include: {
          contestant: true,
        },
        orderBy: { points: 'desc' }, // Sort by points (5 = 1st place, 4 = 2nd, etc.)
      },
    },
  });

  if (!task || task.officialScores.length === 0) {
    // No official scores yet, return contestants with default descending points
    const contestants = await getSeriesContestants(seriesId);
    return contestants.map((c, index) => ({ ...c, points: 5 - index }));
  }

  // Map to ScoredContestant format - use points directly
  // Already sorted by points DESC (5 = best, 0 = worst/DQ)
  const scores = task.officialScores.map((s) => ({
    id: s.contestant.id,
    name: s.contestant.name,
    imageUrl: s.contestant.imageUrl,
    seriesId: s.contestant.seriesId,
    points: s.points,
  }));

  return scores;
}

/**
 * Get all episodes for a series with their tasks
 * 
 * @param seriesId - The series ID to fetch episodes for
 * @returns Array of episodes with nested tasks
 */
export async function getEpisodesForSeries(seriesId: number) {
  return await prisma.episode.findMany({
    where: { seriesId },
    orderBy: { number: 'asc' },
    include: {
      tasks: {
        orderBy: { number: 'asc' },
      },
    },
  });
}

export async function upsertUserByUsername(
  username: string
): Promise<{ id: string; username: string }> {
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username },
    select: { id: true, username: true },
  });

  if (!user.username) {
    // Defensive: schema allows null for legacy rows, but create/upsert should not.
    throw new Error('Failed to create user with username');
  }

  return { id: user.id, username: user.username };
}

export async function getUserScores(
  userId: string,
  seriesId: number,
  episodeNumber: number,
  taskNumber: number
): Promise<ScoredContestant[] | null> {
  const taskId = await getTaskIdForSeriesEpisodeTask(
    seriesId,
    episodeNumber,
    taskNumber
  );

  if (!taskId) return null;

  const scores = await prisma.userScore.findMany({
    where: { userId, taskId },
    include: { contestant: true },
  });

  if (scores.length === 0) return null;

  return scores.map((s) => ({
    id: s.contestant.id,
    name: s.contestant.name,
    imageUrl: s.contestant.imageUrl,
    seriesId: s.contestant.seriesId,
    points: s.points,
  }));
}

export async function saveUserScores(
  userId: string,
  taskId: number,
  scores: Array<{ contestantId: string; points: number }>
): Promise<void> {
  await prisma.$transaction(
    scores.map((s) =>
      prisma.userScore.upsert({
        where: {
          userId_taskId_contestantId: {
            userId,
            taskId,
            contestantId: s.contestantId,
          },
        },
        update: {
          points: s.points,
        },
        create: {
          userId,
          taskId,
          contestantId: s.contestantId,
          points: s.points,
        },
        select: { id: true },
      })
    )
  );
}

export type CumulativeTotalsRow = {
  contestantId: string;
  officialTotal: number;
  userTotal: number;
};

type CumulativeTotalsParams = {
  seriesId: number;
  episodeNumber: number;
  taskNumber: number;
  userId?: string;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeTotals(rows: Array<{ contestantId: string; officialTotal: unknown; userTotal: unknown }>): CumulativeTotalsRow[] {
  return rows.map((r) => ({
    contestantId: r.contestantId,
    officialTotal: toNumber(r.officialTotal),
    userTotal: toNumber(r.userTotal),
  }));
}

function mergeTotalsByContestant(a: CumulativeTotalsRow[], b: CumulativeTotalsRow[]): CumulativeTotalsRow[] {
  const map = new Map<string, { officialTotal: number; userTotal: number }>();
  const add = (rows: CumulativeTotalsRow[]) => {
    for (const r of rows) {
      const cur = map.get(r.contestantId) ?? { officialTotal: 0, userTotal: 0 };
      map.set(r.contestantId, {
        officialTotal: cur.officialTotal + r.officialTotal,
        userTotal: cur.userTotal + r.userTotal,
      });
    }
  };
  add(a);
  add(b);
  return Array.from(map.entries()).map(([contestantId, v]) => ({
    contestantId,
    officialTotal: v.officialTotal,
    userTotal: v.userTotal,
  }));
}

/**
 * Aggregate official + effective user totals for tasks matching an additional episode/task filter.
 *
 * When `userId` is absent, user totals match official totals (no per-user overrides).
 */
async function aggregateCumulativeTotalsForFilter(
  seriesId: number,
  filterSql: Prisma.Sql,
  userId?: string
): Promise<CumulativeTotalsRow[]> {
  const userJoin = userId
    ? Prisma.sql`
      LEFT JOIN user_scores us
        ON us."taskId" = os."taskId"
       AND us."contestantId" = os."contestantId"
       AND us."userId" = ${userId}
    `
    : Prisma.sql``;

  const userTotalAgg = userId
    ? Prisma.sql`SUM(COALESCE(us.points, os.points))::int`
    : Prisma.sql`SUM(os.points)::int`;

  const rows = await prisma.$queryRaw<
    Array<{ contestantId: string; officialTotal: unknown; userTotal: unknown }>
  >(Prisma.sql`
    SELECT
      os."contestantId" AS "contestantId",
      SUM(os.points)::int AS "officialTotal",
      ${userTotalAgg} AS "userTotal"
    FROM official_scores os
    INNER JOIN tasks t ON t.id = os."taskId"
    INNER JOIN episodes e ON e.id = t."episodeId"
    ${userJoin}
    WHERE
      e."seriesId" = ${seriesId}
      AND ${filterSql}
    GROUP BY os."contestantId"
  `);

  return normalizeTotals(rows);
}

/**
 * Get cumulative episode totals (official + effective user) through a task.
 *
 * Effective user total uses per-task override when present:
 * user_points = COALESCE(user_scores.points, official_scores.points)
 */
export async function getCumulativeEpisodeTotals(
  params: CumulativeTotalsParams
): Promise<CumulativeTotalsRow[]> {
  const { seriesId, episodeNumber, taskNumber, userId } = params;

  return aggregateCumulativeTotalsForFilter(
    seriesId,
    Prisma.sql`e.number = ${episodeNumber} AND t.number <= ${taskNumber}`,
    userId
  );
}

/**
 * Get cumulative series totals (official + effective user) through an episode/task selection.
 *
 * Includes all tasks in episodes prior to episodeNumber, plus tasks <= taskNumber in episodeNumber.
 */
export async function getCumulativeSeriesTotals(
  params: CumulativeTotalsParams
): Promise<CumulativeTotalsRow[]> {
  const { seriesId, episodeNumber, taskNumber, userId } = params;

  const currentEpisodePartial = await aggregateCumulativeTotalsForFilter(
    seriesId,
    Prisma.sql`e.number = ${episodeNumber} AND t.number <= ${taskNumber}`,
    userId
  );

  if (episodeNumber <= 1) {
    return currentEpisodePartial;
  }

  const priorEpisodes = await aggregateCumulativeTotalsForFilter(
    seriesId,
    Prisma.sql`e.number < ${episodeNumber}`,
    userId
  );

  return mergeTotalsByContestant(priorEpisodes, currentEpisodePartial);
}

