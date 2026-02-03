import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Contestant } from '@/types/contestant';
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
  const [contestants, setContestants] = useState<Contestant[]>([]);
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
      setContestants([]);
      setIsLoading(false);
      return;
    }

    // Try to load saved order from localStorage
    try {
      const savedOrder = localStorage.getItem(getStorageKey());
      if (savedOrder) {
        const savedIds = JSON.parse(savedOrder) as string[];
        
        // Reorder contestants based on saved order
        const orderedContestants = savedIds
          .map((id) => series.contestants.find((c) => c.id === id))
          .filter((c): c is Contestant => c !== undefined);
        
        // If saved order matches current contestants, use it
        if (orderedContestants.length === series.contestants.length) {
          setContestants(orderedContestants);
        } else {
          // Otherwise use default order
          setContestants(series.contestants);
        }
      } else {
        // No saved order, use default
        setContestants(series.contestants);
      }
    } catch (error) {
      console.error('Error loading saved contestant order:', error);
      setContestants(series.contestants);
    }
    
    setIsLoading(false);
  }, [seriesId, getStorageKey]);

  // Save order to localStorage whenever contestants array changes
  useEffect(() => {
    if (contestants.length === 0 || isLoading) return;

    try {
      const contestantIds = contestants.map((c) => c.id);
      localStorage.setItem(getStorageKey(), JSON.stringify(contestantIds));
    } catch (error) {
      console.error('Error saving contestant order:', error);
    }
  }, [contestants, getStorageKey, isLoading]);

  /**
   * Handle drag end event from dnd-kit
   * Reorders the contestants array based on the drag operation
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Only reorder if the item was dropped over a different position
    if (over && active.id !== over.id) {
      setContestants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        // Use arrayMove utility from dnd-kit to reorder the array
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  return {
    contestants,
    isLoading,
    handleDragEnd,
  };
}
