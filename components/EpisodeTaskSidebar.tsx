'use client';

import { useEffect, useState } from 'react';
import { fetchEpisodesAction, type Episode } from '@/app/actions/fetch-episodes';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface EpisodeTaskSidebarProps {
  /** The series ID to display episodes for */
  seriesId: number;
  /** The currently selected episode ID */
  currentEpisode: number;
  /** The currently selected task ID */
  currentTask: number;
  /** Callback when a task is selected */
  onTaskSelect: (episodeId: number, taskId: number) => void;
}

/**
 * EpisodeTaskSidebar Component
 * 
 * Displays a collapsible sidebar with episodes and their tasks using shadcn/ui Accordion.
 * Features:
 * - Smooth expand/collapse animations
 * - Current episode auto-expanded
 * - Visual highlighting for active task
 * - Full keyboard accessibility
 */
export default function EpisodeTaskSidebar({
  seriesId,
  currentEpisode,
  currentTask,
  onTaskSelect,
}: EpisodeTaskSidebarProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEpisodes() {
      setIsLoading(true);
      const result = await fetchEpisodesAction(seriesId);
      
      if (result.success) {
        setEpisodes(result.data);
      } else {
        console.error('Failed to load episodes:', result.error);
        setEpisodes([]);
      }
      
      setIsLoading(false);
    }
    
    loadEpisodes();
  }, [seriesId]);

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
          Episodes
        </h2>
        
        {isLoading ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading episodes...
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            No episodes found for this series.
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={`episode-${currentEpisode}`}
            key={`series-${seriesId}-episode-${currentEpisode}`}
            className="space-y-1"
          >
            {episodes.map((episode) => (
              <AccordionItem
                key={episode.id}
                value={`episode-${episode.number}`}
                className={cn(
                  'border-0 rounded-lg',
                  currentEpisode === episode.number && 'bg-zinc-50 dark:bg-zinc-800/50'
                )}
              >
                <AccordionTrigger
                  className={cn(
                    'px-3 py-2 text-left hover:no-underline hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg',
                    'text-sm font-medium text-zinc-900 dark:text-zinc-100'
                  )}
                >
                  {episode.name}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-2 pt-1">
                  <div className="space-y-1">
                    {episode.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskSelect(episode.number, task.number)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                          currentEpisode === episode.number && currentTask === task.number
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-zinc-700 dark:text-zinc-300'
                        )}
                        aria-current={
                          currentEpisode === episode.number && currentTask === task.number
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
      </div>
    </aside>
  );
}
