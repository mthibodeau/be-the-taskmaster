'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import ContestantGallery from '@/components/ContestantGallery';
import SeriesEpisodeTaskSidebar from '@/components/SeriesEpisodeTaskSidebar';
import UserInfo from '@/components/UserInfo';
import { fetchEpisodesAction, type Episode } from '@/app/actions/fetch-episodes';
import { useUser } from '@/contexts/UserContext';
import { useSeriesGallery } from '@/hooks/useSeriesGallery';

export default function Home() {
  const { user } = useUser();
  const userId = user.status === 'authenticated' ? user.userId : undefined;

  const [selectedSeries, setSelectedSeries] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedTask, setSelectedTask] = useState(1);

  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    async function loadEpisodes() {
      const result = await fetchEpisodesAction(selectedSeries);
      if (result.success) {
        setEpisodes(result.data);
      } else {
        console.error('Failed to load episodes for header:', result.error);
        setEpisodes([]);
      }
    }
    loadEpisodes();
  }, [selectedSeries]);

  const selectedTaskDescription = useMemo(() => {
    const episode = episodes.find((ep) => ep.number === selectedEpisode);
    const task = episode?.tasks.find((t) => t.number === selectedTask);
    return task?.description ?? null;
  }, [episodes, selectedEpisode, selectedTask]);

  const gallery = useSeriesGallery(selectedSeries, selectedEpisode, selectedTask, userId);

  const attemptSelect = useCallback((seriesId: number, episodeNumber: number, taskNumber: number) => {
    if (gallery.isDirty) {
      const ok = window.confirm('You have unsaved changes. Discard them and navigate away?');
      if (!ok) return;
      gallery.discardDraft();
    }
    setSelectedSeries(seriesId);
    setSelectedEpisode(episodeNumber);
    setSelectedTask(taskNumber);
  }, [gallery]);

  return (
    <div className="flex h-screen overflow-hidden">
      <SeriesEpisodeTaskSidebar
        currentSeries={selectedSeries}
        currentEpisode={selectedEpisode}
        currentTask={selectedTask}
        onSelect={attemptSelect}
        episodesForCurrentSeries={episodes}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-start">
            <div className="sm:col-span-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Taskmaster
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Official scores and guest rescoring
              </p>
            </div>

            <div className="sm:col-span-1 flex flex-col items-center text-center">
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Episode {selectedEpisode}
              </div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Task {selectedTask}
              </div>
              <div className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                {selectedTaskDescription ?? 'No description available.'}
              </div>
            </div>

            <div className="sm:col-span-1 flex justify-start sm:justify-end">
              <UserInfo />
            </div>
          </div>
          
          {/* Contestant Gallery */}
          <ContestantGallery
            userId={userId}
            scoredContestants={gallery.scoredContestants}
            contestantsByPoints={gallery.contestantsByPoints}
            allPoints={gallery.allPoints}
            isLoading={gallery.isLoading}
            viewMode={gallery.viewMode}
            setViewMode={gallery.setViewMode}
            isDirty={gallery.isDirty}
            save={gallery.save}
            resetToOfficial={gallery.resetToOfficial}
            handleDragEnd={gallery.handleDragEnd}
          />
        </div>
      </main>
    </div>
  );
}
