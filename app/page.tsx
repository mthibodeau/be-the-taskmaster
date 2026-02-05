'use client';

import { useState, useEffect } from 'react';
import SeriesSelector from '@/components/SeriesSelector';
import ContestantGallery from '@/components/ContestantGallery';
import EpisodeTaskSidebar from '@/components/EpisodeTaskSidebar';

export default function Home() {
  const [selectedSeries, setSelectedSeries] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedTask, setSelectedTask] = useState(1);

  // Reset to Episode 1, Task 1 when series changes
  useEffect(() => {
    setSelectedEpisode(1);
    setSelectedTask(1);
  }, [selectedSeries]);

  // Handle task selection from sidebar
  const handleTaskSelect = (episodeId: number, taskId: number) => {
    setSelectedEpisode(episodeId);
    setSelectedTask(taskId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Episode/Task Sidebar */}
      <EpisodeTaskSidebar
        seriesId={selectedSeries}
        currentEpisode={selectedEpisode}
        currentTask={selectedTask}
        onTaskSelect={handleTaskSelect}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Taskmaster Contestant Scores
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Select a series, episode, and task to score contestants
            </p>
          </div>
          
          {/* Series Selector */}
          <div className="mb-6">
            <SeriesSelector
              currentSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
            />
          </div>
          
          {/* Current Context Display */}
          <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Current View:</span> Episode {selectedEpisode}, Task {selectedTask}
          </div>
          
          {/* Contestant Gallery */}
          <ContestantGallery 
            seriesId={selectedSeries}
            episodeId={selectedEpisode}
            taskId={selectedTask}
          />
        </div>
      </main>
    </div>
  );
}
