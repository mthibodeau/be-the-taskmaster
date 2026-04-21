'use client';

import type { Episode } from '@/app/actions/fetch-episodes';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EpisodeItem } from './EpisodeItem';

export function SeriesItem({
  seriesId,
  seriesLabel,
  currentSeries,
  currentEpisode,
  currentTask,
  episodesForThisSeries,
  isSeriesLoading,
  onEnsureEpisodes,
  onSelect,
}: {
  seriesId: number;
  seriesLabel: string;
  currentSeries: number;
  currentEpisode: number;
  currentTask: number;
  episodesForThisSeries?: Episode[];
  isSeriesLoading: boolean;
  onEnsureEpisodes: (seriesId: number) => Promise<Episode[]>;
  onSelect: (seriesId: number, episodeNumber: number, taskNumber: number) => void;
}) {
  const isSeriesOpen = currentSeries === seriesId;

  return (
    <AccordionItem
      value={`series-${seriesId}`}
      className={cn('border-0 rounded-lg', isSeriesOpen && 'bg-zinc-50 dark:bg-zinc-800/50')}
    >
      <AccordionTrigger
        className={cn(
          'px-3 py-2 text-left hover:no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg',
          'text-sm font-medium text-zinc-900 dark:text-zinc-100'
        )}
        onClick={() => void onEnsureEpisodes(seriesId)}
      >
        {seriesLabel}
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
            key={`series-${seriesId}-episode-${currentEpisode}`}
            className="space-y-1"
          >
            {episodesForThisSeries.map((episode) => (
              <EpisodeItem
                key={episode.id}
                seriesId={seriesId}
                episode={episode}
                isActiveEpisode={isSeriesOpen && currentEpisode === episode.number}
                currentSeries={currentSeries}
                currentEpisode={currentEpisode}
                currentTask={currentTask}
                onSelect={onSelect}
              />
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

