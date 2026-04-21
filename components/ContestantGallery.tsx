'use client';

import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { ScoredContestant } from '@/types/contestant';
import PointsSeal from './PointsSeal';
import { PointsColumn } from '@/components/gallery/PointsColumn';
import { GalleryControls } from '@/components/gallery/GalleryControls';

interface ContestantGalleryProps {
  userId?: string;

  scoredContestants: ScoredContestant[];
  contestantsByPoints: Record<number, ScoredContestant[]>;
  allPoints: readonly number[];
  isLoading: boolean;

  viewMode: 'user' | 'official';
  setViewMode: (mode: 'user' | 'official') => void;
  isDirty: boolean;
  save: () => Promise<{ success: true } | { success: false; error: string }>;
  resetToOfficial: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export default function ContestantGallery({
  userId,
  scoredContestants,
  contestantsByPoints,
  allPoints,
  isLoading,
  handleDragEnd,
  viewMode,
  setViewMode,
  isDirty,
  save,
  resetToOfficial,
}: ContestantGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isReadOnly = viewMode === 'official' || !userId;

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEndWrapper = (event: DragEndEvent) => {
    setActiveId(null);
    if (isReadOnly) return;
    handleDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find the active contestant for the drag overlay
  const activeContestant = activeId
    ? scoredContestants.find((c) => c.id === activeId)
    : null;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          Loading contestants...
        </div>
      </div>
    );
  }

  if (scoredContestants.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          No contestants found for this series.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEndWrapper}
        onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={[...scoredContestants.map((c) => c.id), ...allPoints.map((p) => `points-${p}`)]}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
              {allPoints.map((points) => (
                <PointsColumn
                  key={points}
                  points={points}
                  contestants={contestantsByPoints[points] || []}
                  dragDisabled={isReadOnly}
                />
              ))}
            </div>
            
            {/* Seals row - aligned horizontally below all content */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              {allPoints.map((points) => {
                return <PointsSeal key={points} points={points} />;
              })}
          </div>
        </SortableContext>

        {/* DragOverlay shows a copy of the dragged item that follows the cursor */}
        <DragOverlay>
          {activeContestant ? (
            <div className="relative w-48 opacity-90 cursor-grabbing">
              <div className="relative aspect-[225/266] overflow-hidden rounded-lg shadow-2xl">
                <Image
                  src={activeContestant.imageUrl}
                  alt={activeContestant.name}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-6 text-center text-sm text-zinc-500">
        {isReadOnly ? (
          <p>Switch to “My Scores” to edit.</p>
        ) : (
          <p>💡 Drag contestants to reorder or stack them on top of each other to share points.</p>
        )}
      </div>

      <GalleryControls
        userId={userId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isDirty={isDirty}
        onResetToOfficial={resetToOfficial}
        onSave={save}
      />
    </div>
  );
}
