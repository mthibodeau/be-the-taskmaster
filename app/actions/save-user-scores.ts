'use server';

import { prisma } from '@/lib/prisma';
import { saveUserScores } from '@/lib/db.server';

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function saveUserScoresAction(
  userId: string,
  seriesId: number,
  episodeNumber: number,
  taskNumber: number,
  scores: Array<{ contestantId: string; points: number }>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const episode = await prisma.episode.findUnique({
      where: {
        seriesId_number: {
          seriesId,
          number: episodeNumber,
        },
      },
      select: { id: true },
    });

    if (!episode) {
      return { success: false, error: 'Episode not found' };
    }

    const task = await prisma.task.findUnique({
      where: {
        episodeId_number: {
          episodeId: episode.id,
          number: taskNumber,
        },
      },
      select: { id: true },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    await saveUserScores(userId, task.id, scores);
    return { success: true };
  } catch (error) {
    console.error('saveUserScoresAction failed', {
      userId,
      seriesId,
      episodeNumber,
      taskNumber,
      error,
    });
    return { success: false, error: toErrorMessage(error, 'Failed to save user scores') };
  }
}

