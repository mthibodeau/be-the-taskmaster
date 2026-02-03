'use client';

import { useState } from 'react';
import SeriesSelector from '@/components/SeriesSelector';
import ContestantGallery from '@/components/ContestantGallery';

export default function Home() {
  const [selectedSeries, setSelectedSeries] = useState(4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <main className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Taskmaster Contestant Rankings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select a series and rank the contestants
          </p>
        </div>
        
        <SeriesSelector
          currentSeries={selectedSeries}
          onSeriesChange={setSelectedSeries}
        />
        
        <ContestantGallery seriesId={selectedSeries} />
      </main>
    </div>
  );
}
