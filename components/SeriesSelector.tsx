'use client';

import { getAllSeries } from '@/data/series';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SeriesSelectorProps {
  /** Currently selected series ID */
  currentSeries: number;
  
  /** Callback when series selection changes */
  onSeriesChange: (seriesId: number) => void;
}

/**
 * SeriesSelector Component
 * 
 * Displays a styled dropdown to select between different series using shadcn/ui Select.
 * Shows all available series from the data file with smooth animations.
 * 
 * @param currentSeries - The currently selected series ID
 * @param onSeriesChange - Callback function when user selects a different series
 */
export default function SeriesSelector({
  currentSeries,
  onSeriesChange,
}: SeriesSelectorProps) {
  const allSeries = getAllSeries();

  const handleValueChange = (value: string) => {
    const newSeriesId = parseInt(value, 10);
    if (!isNaN(newSeriesId)) {
      onSeriesChange(newSeriesId);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="series-selector"
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap"
      >
        Select Series:
      </label>
      <Select
        value={currentSeries.toString()}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          id="series-selector"
          className="w-[200px] bg-white dark:bg-zinc-900"
        >
          <SelectValue placeholder="Select a series" />
        </SelectTrigger>
        <SelectContent>
          {allSeries.map((series) => (
            <SelectItem key={series.id} value={series.id.toString()}>
              {series.displayName || series.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
