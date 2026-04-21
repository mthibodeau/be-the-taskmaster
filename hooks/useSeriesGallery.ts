import { useEffect, useMemo, useState, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { ScoredContestant } from '@/types/contestant';
import { hasDBData } from '@/data/series';
import { fetchScoresAction, fetchContestantsAction } from '@/app/actions/fetch-scores';
import { fetchUserScoresAction } from '@/app/actions/fetch-user-scores';
import { saveUserScoresAction } from '@/app/actions/save-user-scores';

// Constants - possible point values (0 for DQ, 1-5 standard, higher with bonus)
const ALL_POINTS = [0, 1, 2, 3, 4, 5] as const;

type ViewMode = 'user' | 'official';

function pointsMap(items: ScoredContestant[]): Map<string, number> {
  return new Map(items.map((c) => [c.id, c.points]));
}

function pointsEqual(a: ScoredContestant[], b: ScoredContestant[]): boolean {
  const am = pointsMap(a);
  const bm = pointsMap(b);
  if (am.size !== bm.size) return false;
  for (const [id, points] of am) {
    if (bm.get(id) !== points) return false;
  }
  return true;
}

function hydrateUserScores(
  official: ScoredContestant[],
  userScores: ScoredContestant[]
): ScoredContestant[] {
  const userPoints = new Map(userScores.map((s) => [s.id, s.points]));
  return official.map((c) => ({
    ...c,
    points: userPoints.get(c.id) ?? c.points,
  }));
}

/**
 * Custom hook for managing contestant gallery with series, episode, and task support
 * 
 * This hook handles:
 * - Loading official scores from database for specific tasks (all series)
 * - Loading user scores for a task (optional, per user)
 * - Managing drag-and-drop ordering as a draft until explicitly saved
 * 
 * @param seriesId - The series number to display
 * @param episodeId - The episode number to display (optional)
 * @param taskId - The task number to display (optional)
 * @param userId - The user ID (optional). When present, enables \"My Scores\".
 * @returns contestants array, grouped scores, and drag handler function
 */
export function useSeriesGallery(seriesId: number, episodeId?: number, taskId?: number, userId?: string) {
  const [officialScores, setOfficialScores] = useState<ScoredContestant[]>([]);
  const [baselineScores, setBaselineScores] = useState<ScoredContestant[]>([]);
  const [draftScores, setDraftScores] = useState<ScoredContestant[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('official');
  const [hasUserScoresForTask, setHasUserScoresForTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDirty = useMemo(() => {
    if (viewMode !== 'user') return false;
    return !pointsEqual(draftScores, baselineScores);
  }, [draftScores, baselineScores, viewMode]);

  // Load contestants for the selected series
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const sid = seriesId;
      const eid = episodeId;
      const tid = taskId;

      // Check if series has database data and specific task is requested
      if (hasDBData(sid) && eid !== undefined && tid !== undefined) {
        // Fetch official scores from database via Server Action
        const result = await fetchScoresAction(sid, eid, tid);

        if (result.success) {
          const official = result.data;
          setOfficialScores(official);

          if (userId) {
            const userResult = await fetchUserScoresAction(userId, sid, eid, tid);
            if (userResult.success && userResult.data) {
              const hydrated = hydrateUserScores(official, userResult.data);
              setHasUserScoresForTask(true);
              setBaselineScores(hydrated);
              setDraftScores(hydrated);
              setViewMode('user');
              setIsLoading(false);
              return;
            }
          }

          // No user scores (or not logged in): default to official
          setHasUserScoresForTask(false);
          setBaselineScores(official);
          setDraftScores(official);
          setViewMode('official');
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
        setOfficialScores(contestantsResult.data);
        setHasUserScoresForTask(false);
        setBaselineScores(contestantsResult.data);
        setDraftScores(contestantsResult.data);
        setViewMode('official');
      } else {
        console.error('Failed to load contestants:', contestantsResult.error);
        setOfficialScores([]);
        setBaselineScores([]);
        setDraftScores([]);
      }

      setIsLoading(false);
    }

    loadData();
  }, [seriesId, episodeId, taskId, userId]);

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
    if (viewMode !== 'user') return;

    setDraftScores((items) => {
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
  }, [viewMode]);

  const save = useCallback(async () => {
    if (!userId) return { success: false as const, error: 'Not logged in' };
    if (viewMode !== 'user') return { success: false as const, error: 'Not in My Scores mode' };
    if (episodeId === undefined || taskId === undefined) {
      return { success: false as const, error: 'No task selected' };
    }

    const result = await saveUserScoresAction(
      userId,
      seriesId,
      episodeId,
      taskId,
      draftScores.map((c) => ({ contestantId: c.id, points: c.points }))
    );

    if (!result.success) return { success: false as const, error: result.error };

    setBaselineScores(draftScores);
    setHasUserScoresForTask(true);
    return { success: true as const };
  }, [userId, viewMode, episodeId, taskId, seriesId, draftScores]);

  const resetToOfficial = useCallback(() => {
    if (viewMode !== 'user') return;
    setDraftScores(officialScores);
  }, [officialScores, viewMode]);

  const discardDraft = useCallback(() => {
    setDraftScores(baselineScores);
  }, [baselineScores]);

  // Group contestants by points for display
  const visibleScores = viewMode === 'user' ? draftScores : officialScores;

  const contestantsByPoints = visibleScores.reduce((acc, contestant) => {
    if (!acc[contestant.points]) {
      acc[contestant.points] = [];
    }
    acc[contestant.points].push(contestant);
    return acc;
  }, {} as Record<number, ScoredContestant[]>);

  return {
    viewMode,
    setViewMode,
    hasUserScoresForTask,
    officialScores,
    baselineScores,
    draftScores,
    scoredContestants: visibleScores,
    contestantsByPoints,
    allPoints: ALL_POINTS,
    isLoading,
    isDirty,
    handleDragEnd,
    save,
    resetToOfficial,
    discardDraft,
  };
}
