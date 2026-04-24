'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/AppHeader';
import ContestantGallery from '@/components/ContestantGallery';
import { ScoreChartsLoadingSkeleton } from '@/components/ScoreChartsLoadingSkeleton';
import SeriesEpisodeTaskSidebar from '@/components/SeriesEpisodeTaskSidebar';
import TaskHeader from '@/components/TaskHeader';
import { fetchEpisodesAction, type Episode } from '@/app/actions/fetch-episodes';
import { useUser } from '@/contexts/UserContext';
import { useSeriesGallery } from '@/hooks/useSeriesGallery';
import { useCumulativeScores } from '@/hooks/useCumulativeScores';

const CumulativeScoreCharts = dynamic(
  () => import('@/components/CumulativeScoreCharts'),
  { ssr: false, loading: () => <ScoreChartsLoadingSkeleton /> }
);

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
  const cumulative = useCumulativeScores(
    selectedSeries,
    selectedEpisode,
    selectedTask,
    userId,
    gallery.scoresSavedVersion
  );

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
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <SeriesEpisodeTaskSidebar
          currentSeries={selectedSeries}
          currentEpisode={selectedEpisode}
          currentTask={selectedTask}
          onSelect={attemptSelect}
          episodesForCurrentSeries={episodes}
        />

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <div className="container mx-auto py-6 px-4">
            <div className="mb-6 flex justify-center">
              <TaskHeader
                episodeNumber={selectedEpisode}
                taskNumber={selectedTask}
                description={selectedTaskDescription}
              />
            </div>

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

            {cumulative.status === 'loaded' ? (
              <CumulativeScoreCharts
                selection={{
                  seriesId: selectedSeries,
                  episodeNumber: selectedEpisode,
                  taskNumber: selectedTask,
                }}
                contestants={cumulative.contestants}
                episodeTotals={cumulative.episodeTotals}
                seriesTotals={cumulative.seriesTotals}
                episodeMax={cumulative.episodeMax}
                seriesMax={cumulative.seriesMax}
              />
            ) : cumulative.status === 'error' ? (
              <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                Failed to load cumulative totals: {cumulative.error}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
