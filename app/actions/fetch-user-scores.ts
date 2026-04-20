'use server';

import { getUserScores } from '@/lib/db.server';
import type { ScoredContestant } from '@/types/contestant';

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function fetchUserScoresAction(
  userId: string,
  seriesId: number,
  episodeNumber: number,
  taskNumber: number
): Promise<
  | { success: true; data: ScoredContestant[] | null }
  | { success: false; error: string }
> {
  try {
    const scores = await getUserScores(userId, seriesId, episodeNumber, taskNumber);
    return { success: true, data: scores };
  } catch (error) {
    console.error('fetchUserScoresAction failed', {
      userId,
      seriesId,
      episodeNumber,
      taskNumber,
      error,
    });
    return { success: false, error: toErrorMessage(error, 'Failed to load user scores') };
  }
}

