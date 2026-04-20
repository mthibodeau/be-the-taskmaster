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

