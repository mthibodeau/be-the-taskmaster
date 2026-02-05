import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { ScoredContestant } from '@/types/contestant';
import { hasDBData } from '@/data/series';
import { fetchScoresAction, fetchContestantsAction } from '@/app/actions/fetch-scores';

// Constants - possible point values (0 for DQ, 1-5 standard, higher with bonus)
const ALL_POINTS = [0, 1, 2, 3, 4, 5] as const;

/**
 * Custom hook for managing contestant gallery with series, episode, and task support
 * 
 * This hook handles:
 * - Loading official scores from database for specific tasks (all series)
 * - Loading contestants with default points when no task is specified
 * - Managing drag-and-drop ordering in memory (not persisted)
 * 
 * @param seriesId - The series number to display
 * @param episodeId - The episode number to display (optional)
 * @param taskId - The task number to display (optional)
 * @returns contestants array, grouped scores, and drag handler function
 */
export function useSeriesGallery(seriesId: number, episodeId?: number, taskId?: number) {
  const [scoredContestants, setScoredContestants] = useState<ScoredContestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contestants for the selected series
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Check if series has database data and specific task is requested
      if (hasDBData(seriesId) && episodeId !== undefined && taskId !== undefined) {
        // Fetch official scores from database via Server Action
        const result = await fetchScoresAction(seriesId, episodeId, taskId);

        if (result.success) {
          setScoredContestants(result.data);
          setIsLoading(false);
          return;
        } else {
          console.error('Failed to load scores from database:', result.error);
          // Fall through to contestant fallback
        }
      }

      // Fallback: fetch just contestants with default points
      const contestantsResult = await fetchContestantsAction(seriesId);
      if (contestantsResult.success) {
        setScoredContestants(contestantsResult.data);
      } else {
        console.error('Failed to load contestants:', contestantsResult.error);
        setScoredContestants([]);
      }

      setIsLoading(false);
    }

    loadData();
  }, [seriesId, episodeId, taskId]);

  /**
   * Handle drag end event from dnd-kit
   * Supports three behaviors:
   * 1. Dropping on another contestant: merge into same points group (stack)
   * 2. Dropping on an empty points slot: assign to that points value (unstack)
   * 3. Dropping in empty space: reorder and assign new points
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    setScoredContestants((items) => {
      const draggedItem = items.find((item) => item.id === active.id);
      if (!draggedItem) return items;

      // Check if dropped on a points slot (format: "points-{number}")
      if (typeof over.id === 'string' && over.id.startsWith('points-')) {
        const targetPoints = parseInt(over.id.replace('points-', ''), 10);
        if (!isNaN(targetPoints) && targetPoints >= 0) {
          // Assign to the target points group
          return items.map((item) =>
            item.id === active.id ? { ...item, points: targetPoints } : item
          );
        }
      }

      // Check if dropped on another contestant
      const targetItem = items.find((item) => item.id === over.id);
      if (targetItem && active.id !== over.id) {
        // Merge into same points group (stacking)
        const targetPoints = targetItem.points;
        return items.map((item) =>
          item.id === active.id ? { ...item, points: targetPoints } : item
        );
      }

      // If dropped in empty space, don't change anything
      return items;
    });
  }, []);

  // Group contestants by points for display
  const contestantsByPoints = scoredContestants.reduce((acc, contestant) => {
    if (!acc[contestant.points]) {
      acc[contestant.points] = [];
    }
    acc[contestant.points].push(contestant);
    return acc;
  }, {} as Record<number, ScoredContestant[]>);

  return {
    scoredContestants,
    contestantsByPoints,
    allPoints: ALL_POINTS,
    isLoading,
    handleDragEnd,
  };
}
