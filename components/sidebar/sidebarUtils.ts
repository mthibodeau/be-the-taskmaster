'use client';

import type { Episode } from '@/app/actions/fetch-episodes';

export function firstTaskSelectionForSeries(
  seriesId: number,
  episodes: Episode[]
): { seriesId: number; episodeNumber: number; taskNumber: number } {
  const firstEpisode = [...episodes].sort((a, b) => a.number - b.number)[0];
  const firstTask = firstEpisode?.tasks?.slice().sort((a, b) => a.number - b.number)[0];

  return {
    seriesId,
    episodeNumber: firstEpisode?.number ?? 1,
    taskNumber: firstTask?.number ?? 1,
  };
}

export function firstTaskNumberForEpisode(episode: Episode): number {
  const firstTask = episode.tasks?.slice().sort((a, b) => a.number - b.number)[0];
  return firstTask?.number ?? 1;
}

