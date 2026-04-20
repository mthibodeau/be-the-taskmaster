'use server';

import { getEpisodesForSeries } from '@/lib/db.server';

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export interface Task {
  id: number;
  number: number;
  name: string;
  description: string | null;
  episodeId: number;
}

export interface Episode {
  id: number;
  number: number;
  name: string;
  seriesId: number;
  tasks: Task[];
}

/**
 * Server Action to fetch episodes for a series
 * 
 * @param seriesId - The series ID to fetch episodes for
 * @returns Episodes with tasks or error
 */
export async function fetchEpisodesAction(
  seriesId: number
): Promise<{ success: true; data: Episode[] } | { success: false; error: string }> {
  try {
    const episodes = await getEpisodesForSeries(seriesId);
    
    // Transform database result to match expected format
    const formattedEpisodes: Episode[] = episodes.map((ep) => ({
      id: ep.id,
      number: ep.number,
      name: ep.name,
      seriesId: ep.seriesId,
      tasks: ep.tasks.map((task) => ({
        id: task.id,
        number: task.number,
        name: task.name || `Task ${task.number}`,
        description: task.description,
        episodeId: task.episodeId,
      })),
    }));
    
    return { success: true, data: formattedEpisodes };
  } catch (error) {
    console.error('fetchEpisodesAction failed', { seriesId, error });
    return { 
      success: false, 
      error: toErrorMessage(error, 'Failed to load episodes'),
    };
  }
}
