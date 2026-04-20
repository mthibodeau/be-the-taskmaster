import { prisma } from './prisma';
import { Contestant, ScoredContestant } from '@/types/contestant';

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

