'use server';

import { getOfficialScores, getSeriesContestants } from '@/lib/db';
import { ScoredContestant } from '@/types/contestant';

/**
 * Server Actions for Scores
 * 
 * These functions run exclusively on the server.
 * They provide a secure way for client components to fetch data
 * without exposing database credentials.
 * 
 * Benefits:
 * - Type-safe: Full TypeScript support across server/client boundary
 * - Secure: Database credentials never exposed to browser
 * - Simple: No need for separate API routes
 * - Automatic: Next.js handles serialization and caching
 */

/**
 * Fetch official scores for a specific task
 * 
 * @param seriesId - The series ID
 * @param episodeId - The episode number within the series
 * @param taskId - The task number within the episode
 * @returns Success response with scores or error response
 */
export async function fetchScoresAction(
  seriesId: number,
  episodeId: number,
  taskId: number
): Promise<{ success: true; data: ScoredContestant[] } | { success: false; error: string }> {
  try {
    const scores = await getOfficialScores(seriesId, episodeId, taskId);
    return { success: true, data: scores };
  } catch (error) {
    console.error('Server Action error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load scores'
    };
  }
}

/**
 * Fetch all contestants for a series with default sequential points
 * 
 * Used as fallback or for series without official scores yet.
 * 
 * @param seriesId - The series ID
 * @returns Success response with contestants or error response
 */
export async function fetchContestantsAction(
  seriesId: number
): Promise<{ success: true; data: ScoredContestant[] } | { success: false; error: string }> {
  try {
    const contestants = await getSeriesContestants(seriesId);
    // Return with default sequential points (5-1)
    const scoredContestants = contestants.map((c, index) => ({
      ...c,
      points: 5 - index,
    }));
    return { success: true, data: scoredContestants };
  } catch (error) {
    console.error('Failed to fetch contestants:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load contestants'
    };
  }
}
