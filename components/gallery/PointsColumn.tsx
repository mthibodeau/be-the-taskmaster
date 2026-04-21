'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ScoredContestant } from '@/types/contestant';
import clsx from 'clsx';
import { ContestantCard } from './ContestantCard';

export function PointsColumn({
  points,
  contestants,
  dragDisabled,
}: {
  points: number;
  contestants: ScoredContestant[];
  dragDisabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `points-${points}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative flex flex-col items-center rounded-lg transition-colors',
        isOver && 'bg-zinc-100 dark:bg-zinc-900'
      )}
    >
      <div className="w-full flex flex-col gap-2">
        {contestants.map((contestant) => (
          <ContestantCard
            key={contestant.id}
            contestant={contestant}
            isLarge={points === 5}
            disabled={dragDisabled}
          />
        ))}
      </div>
    </div>
  );
}

