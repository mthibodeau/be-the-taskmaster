'use client';

import { useCallback, useMemo, useState } from 'react';
import { getAllSeries } from '@/data/series';
import { fetchEpisodesAction, type Episode } from '@/app/actions/fetch-episodes';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type EpisodesCache = Record<number, Episode[]>;

function firstTaskSelectionForSeries(
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

interface SeriesEpisodeTaskSidebarProps {
  currentSeries: number;
  currentEpisode: number;
  currentTask: number;
  onSelect: (seriesId: number, episodeNumber: number, taskNumber: number) => void;
  /** Episodes/tasks for the currently selected series (provided by page to avoid duplicate fetch) */
  episodesForCurrentSeries?: Episode[];
}

export default function SeriesEpisodeTaskSidebar({
  currentSeries,
  currentEpisode,
  currentTask,
  onSelect,
  episodesForCurrentSeries,
}: SeriesEpisodeTaskSidebarProps) {
  const allSeries = useMemo(() => getAllSeries(), []);
  const [episodesBySeries, setEpisodesBySeries] = useState<EpisodesCache>({});
  const [loadingSeriesId, setLoadingSeriesId] = useState<number | null>(null);

  const ensureEpisodes = useCallback(async (seriesId: number): Promise<Episode[]> => {
    if (seriesId === currentSeries && episodesForCurrentSeries) {
      // Keep cache in sync for current series to support selection logic.
      setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: episodesForCurrentSeries }));
      return episodesForCurrentSeries;
    }

    if (episodesBySeries[seriesId]) return episodesBySeries[seriesId];
    setLoadingSeriesId(seriesId);
    const result = await fetchEpisodesAction(seriesId);
    setLoadingSeriesId((prev) => (prev === seriesId ? null : prev));

    if (!result.success) {
      console.error('Failed to load episodes:', { seriesId, error: result.error });
      setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: [] }));
      return [];
    }

    setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: result.data }));
    return result.data;
  }, [currentSeries, episodesForCurrentSeries, episodesBySeries]);

  const isLoading = loadingSeriesId !== null;

  return (
    <aside className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
          Series
        </h2>

        <Accordion
          type="single"
          collapsible
          value={`series-${currentSeries}`}
          onValueChange={(value) => {
            const match = value.match(/^series-(\d+)$/);
            if (!match) return;
            const nextSeriesId = parseInt(match[1], 10);
            if (Number.isNaN(nextSeriesId)) return;

            void (async () => {
              const episodes = await ensureEpisodes(nextSeriesId);
              const { episodeNumber, taskNumber } = firstTaskSelectionForSeries(nextSeriesId, episodes);
              onSelect(nextSeriesId, episodeNumber, taskNumber);
            })();
          }}
          className="space-y-1"
        >
          {allSeries.map((series) => {
            const seriesValue = `series-${series.id}`;
            const isSeriesOpen = currentSeries === series.id;
            const isSeriesLoading = loadingSeriesId === series.id;
            const episodesForThisSeries =
              series.id === currentSeries && episodesForCurrentSeries
                ? episodesForCurrentSeries
                : episodesBySeries[series.id];

            return (
              <AccordionItem
                key={series.id}
                value={seriesValue}
                className={cn('border-0 rounded-lg', isSeriesOpen && 'bg-zinc-50 dark:bg-zinc-800/50')}
              >
                <AccordionTrigger
                  className={cn(
                    'px-3 py-2 text-left hover:no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg',
                    'text-sm font-medium text-zinc-900 dark:text-zinc-100'
                  )}
                  onClick={() => void ensureEpisodes(series.id)}
                >
                  {series.displayName || series.name}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-2 pt-1">
                  {isSeriesLoading ? (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading episodes...</div>
                  ) : !episodesForThisSeries || episodesForThisSeries.length === 0 ? (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">No episodes found.</div>
                  ) : (
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={`episode-${currentEpisode}`}
                      key={`series-${series.id}-episode-${currentEpisode}`}
                      className="space-y-1"
                    >
                      {episodesForThisSeries.map((episode) => (
                        <AccordionItem
                          key={episode.id}
                          value={`episode-${episode.number}`}
                          className={cn(
                            'border-0 rounded-lg',
                            isSeriesOpen && currentEpisode === episode.number && 'bg-white/60 dark:bg-zinc-900/40'
                          )}
                        >
                          <AccordionTrigger
                            className={cn(
                              'px-3 py-2 text-left hover:no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg',
                              'text-sm font-medium text-zinc-900 dark:text-zinc-100'
                            )}
                            onClick={() => {
                              // Selecting an episode should select its first task
                              const firstTask = episode.tasks?.slice().sort((a, b) => a.number - b.number)[0];
                              onSelect(series.id, episode.number, firstTask?.number ?? 1);
                            }}
                          >
                            {episode.name}
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-2 pt-1">
                            <div className="space-y-1">
                              {episode.tasks.map((task) => (
                                <button
                                  key={task.id}
                                  onClick={() => onSelect(series.id, episode.number, task.number)}
                                  className={cn(
                                    'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                    currentSeries === series.id &&
                                      currentEpisode === episode.number &&
                                      currentTask === task.number
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  )}
                                  aria-current={
                                    currentSeries === series.id &&
                                    currentEpisode === episode.number &&
                                    currentTask === task.number
                                      ? 'page'
                                      : undefined
                                  }
                                >
                                  {task.name}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {isLoading ? null : null}
      </div>
    </aside>
  );
}

