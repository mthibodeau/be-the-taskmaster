'use client';

import type { Episode } from '@/app/actions/fetch-episodes';
import { cn } from '@/lib/utils';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { firstTaskNumberForEpisode } from './sidebarUtils';

export function EpisodeItem({
  seriesId,
  episode,
  isActiveEpisode,
  currentSeries,
  currentEpisode,
  currentTask,
  onSelect,
}: {
  seriesId: number;
  episode: Episode;
  isActiveEpisode: boolean;
  currentSeries: number;
  currentEpisode: number;
  currentTask: number;
  onSelect: (seriesId: number, episodeNumber: number, taskNumber: number) => void;
}) {
  return (
    <AccordionItem
      key={episode.id}
      value={`episode-${episode.number}`}
      className={cn('border-0 rounded-lg', isActiveEpisode && 'bg-white/60 dark:bg-zinc-900/40')}
    >
      <AccordionTrigger
        className={cn(
          'px-3 py-2 text-left hover:no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg',
          'text-sm font-medium text-zinc-900 dark:text-zinc-100'
        )}
        onClick={() => {
          onSelect(seriesId, episode.number, firstTaskNumberForEpisode(episode));
        }}
      >
        {episode.name}
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-2 pt-1">
        <div className="space-y-1">
          {episode.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelect(seriesId, episode.number, task.number)}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                currentSeries === seriesId && currentEpisode === episode.number && currentTask === task.number
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}
              aria-current={
                currentSeries === seriesId && currentEpisode === episode.number && currentTask === task.number
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
  );
}

