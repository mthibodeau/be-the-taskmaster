import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Contestant, RankedContestant } from '@/types/contestant';
import { getSeriesById } from '@/data/series';

/**
 * Custom hook for managing contestant gallery with series support
 * 
 * This hook handles:
 * - Loading contestants for a specific series
 * - Managing drag-and-drop ordering
 * - Persisting order to localStorage per series
 * - Restoring saved order on mount
 * 
 * @param seriesId - The series number to display
 * @returns contestants array and drag handler function
 */
export function useSeriesGallery(seriesId: number) {
  const [rankedContestants, setRankedContestants] = useState<RankedContestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate localStorage key for this specific series
  const getStorageKey = useCallback(
    () => `contestant-order-series-${seriesId}`,
    [seriesId]
  );

  // Load contestants for the selected series
  useEffect(() => {
    setIsLoading(true);
    
    const series = getSeriesById(seriesId);
    if (!series) {
      console.warn(`Series ${seriesId} not found`);
      setRankedContestants([]);
      setIsLoading(false);
      return;
    }

    // Try to load saved rankings from localStorage
    try {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData) {
        const parsed = JSON.parse(savedData) as RankedContestant[];
        
        // Validate saved data matches current contestants
        if (Array.isArray(parsed) && parsed.length === series.contestants.length) {
          // Ensure all contestants are present
          const savedIds = new Set(parsed.map((c) => c.id));
          const currentIds = new Set(series.contestants.map((c) => c.id));
          
          if (savedIds.size === currentIds.size && 
              [...savedIds].every((id) => currentIds.has(id))) {
            setRankedContestants(parsed);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // No saved data or invalid, initialize with default ranks (1-5)
      const defaultRanked: RankedContestant[] = series.contestants.map((c, index) => ({
        ...c,
        rank: index + 1,
      }));
      setRankedContestants(defaultRanked);
    } catch (error) {
      console.error('Error loading saved contestant rankings:', error);
      // Initialize with default ranks
      const defaultRanked: RankedContestant[] = series.contestants.map((c, index) => ({
        ...c,
        rank: index + 1,
      }));
      setRankedContestants(defaultRanked);
    }
    
    setIsLoading(false);
  }, [seriesId, getStorageKey]);

  // Save rankings to localStorage whenever rankedContestants array changes
  useEffect(() => {
    if (rankedContestants.length === 0 || isLoading) return;

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(rankedContestants));
    } catch (error) {
      console.error('Error saving contestant rankings:', error);
    }
  }, [rankedContestants, getStorageKey, isLoading]);

  /**
   * Handle drag end event from dnd-kit
   * Supports three behaviors:
   * 1. Dropping on another contestant: merge into same rank (stack)
   * 2. Dropping on an empty rank slot: assign to that rank (unstack)
   * 3. Dropping in empty space: reorder and assign new ranks
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    setRankedContestants((items) => {
      const draggedItem = items.find((item) => item.id === active.id);
      if (!draggedItem) return items;

      // Check if dropped on a rank slot (format: "rank-{number}")
      if (typeof over.id === 'string' && over.id.startsWith('rank-')) {
        const targetRank = parseInt(over.id.replace('rank-', ''), 10);
        if (!isNaN(targetRank) && targetRank >= 0 && targetRank <= 5) {
          // Assign to the target rank (unstacking or moving to empty rank)
          return items.map((item) =>
            item.id === active.id ? { ...item, rank: targetRank } : item
          );
        }
      }

      // Check if dropped on another contestant
      const targetItem = items.find((item) => item.id === over.id);
      if (targetItem && active.id !== over.id) {
        // Merge into same rank (stacking)
        const targetRank = targetItem.rank;
        return items.map((item) =>
          item.id === active.id ? { ...item, rank: targetRank } : item
        );
      }

      // If dropped in empty space, don't change anything
      return items;
    });
  }, []);

  // Group contestants by rank for display
  const contestantsByRank = rankedContestants.reduce((acc, contestant) => {
    if (!acc[contestant.rank]) {
      acc[contestant.rank] = [];
    }
    acc[contestant.rank].push(contestant);
    return acc;
  }, {} as Record<number, RankedContestant[]>);

  // Always show ranks 0-5, even if empty (0 = disqualified)
  const allRanks = [0, 1, 2, 3, 4, 5];

  return {
    rankedContestants,
    contestantsByRank,
    allRanks,
    isLoading,
    handleDragEnd,
  };
}
