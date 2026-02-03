'use client';

import { getAllSeries } from '@/data/series';

interface SeriesSelectorProps {
  /** Currently selected series ID */
  currentSeries: number;
  
  /** Callback when series selection changes */
  onSeriesChange: (seriesId: number) => void;
}

/**
 * SeriesSelector Component
 * 
 * Displays a dropdown to select between different series.
 * Shows all available series from the data file.
 * 
 * @param currentSeries - The currently selected series ID
 * @param onSeriesChange - Callback function when user selects a different series
 */
export default function SeriesSelector({
  currentSeries,
  onSeriesChange,
}: SeriesSelectorProps) {
  const allSeries = getAllSeries();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeriesId = parseInt(event.target.value, 10);
    if (!isNaN(newSeriesId)) {
      onSeriesChange(newSeriesId);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6">
      <div className="flex items-center gap-4">
        <label
          htmlFor="series-selector"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap"
        >
          Select Series:
        </label>
        <select
          id="series-selector"
          value={currentSeries}
          onChange={handleChange}
          className="flex-1 max-w-xs px-4 py-2 rounded-lg border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all cursor-pointer"
          aria-label="Select series"
        >
          {allSeries.map((series) => (
            <option key={series.id} value={series.id}>
              {series.displayName || series.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
