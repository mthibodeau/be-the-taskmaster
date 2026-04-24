'use client';

import { useCallback, useMemo, useState } from 'react';
import { getAllSeries } from '@/data/series';
import { fetchEpisodesAction, type Episode } from '@/app/actions/fetch-episodes';
import {
  Accordion,
} from '@/components/ui/accordion';
import { SeriesItem } from '@/components/sidebar/SeriesItem';
import { firstTaskSelectionForSeries } from '@/components/sidebar/sidebarUtils';

type EpisodesCache = Record<number, Episode[]>;

interface SeriesEpisodeTaskSidebarProps {
  currentSeries: number;
  currentEpisode: number;
  currentTask: number;
  onSelect: (seriesId: number, episodeNumber: number, taskNumber: number) => void;
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
    <aside className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto">
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
          {allSeries.map((series) => (
            <SeriesItem
              key={series.id}
              seriesId={series.id}
              seriesLabel={series.displayName || series.name}
              currentSeries={currentSeries}
              currentEpisode={currentEpisode}
              currentTask={currentTask}
              episodesForThisSeries={
                series.id === currentSeries && episodesForCurrentSeries
                  ? episodesForCurrentSeries
                  : episodesBySeries[series.id]
              }
              isSeriesLoading={loadingSeriesId === series.id}
              onEnsureEpisodes={ensureEpisodes}
              onSelect={onSelect}
            />
          ))}
        </Accordion>

        {isLoading ? null : null}
      </div>
    </aside>
  );
}

