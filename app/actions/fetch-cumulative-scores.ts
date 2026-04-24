'use server';

import { getCumulativeEpisodeTotals, getCumulativeSeriesTotals } from '@/lib/db.server';
import type { CumulativeTotalsRow } from '@/lib/db';

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export type FetchCumulativeScoresResult =
  | {
      success: true;
      data: {
        episodeTotals: CumulativeTotalsRow[];
        seriesTotals: CumulativeTotalsRow[];
      };
    }
  | { success: false; error: string };

export async function fetchCumulativeScoresAction(
  seriesId: number,
  episodeNumber: number,
  taskNumber: number,
  userId?: string
): Promise<FetchCumulativeScoresResult> {
  try {
    const [episodeTotals, seriesTotals] = await Promise.all([
      getCumulativeEpisodeTotals({ seriesId, episodeNumber, taskNumber, userId }),
      getCumulativeSeriesTotals({ seriesId, episodeNumber, taskNumber, userId }),
    ]);

    return {
      success: true,
      data: { episodeTotals, seriesTotals },
    };
  } catch (error) {
    console.error('fetchCumulativeScoresAction failed', {
      seriesId,
      episodeNumber,
      taskNumber,
      userId,
      error,
    });
    return { success: false, error: toErrorMessage(error, 'Failed to load cumulative scores') };
  }
}

