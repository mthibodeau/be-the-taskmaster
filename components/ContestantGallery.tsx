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
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSeriesGallery } from '@/hooks/useSeriesGallery';
import { useState } from 'react';
import { ScoredContestant } from '@/types/contestant';
import PointsSeal from './PointsSeal';
// Note: clsx needs to be installed: npm install clsx
import clsx from 'clsx';

interface ContestantGalleryProps {
  /** The series ID to display contestants for */
  seriesId: number;
  /** The episode ID to display contestants for */
  episodeId: number;
  /** The task ID to display contestants for */
  taskId: number;
}

/**
 * Individual sortable contestant image (no seal, just the image)
 * Used within a points group
 */
function SortableContestantImage({ 
  contestant,
  isLarge = false
}: { 
  contestant: ScoredContestant;
  isLarge?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contestant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative group cursor-grab active:cursor-grabbing rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isDragging && 'z-50',
        isLarge && 'scale-125'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="relative w-full aspect-[225/266] overflow-hidden rounded-lg transition-shadow duration-200 hover:shadow-lg">
        <Image
          src={contestant.imageUrl}
          alt={contestant.name}
          fill
          sizes={isLarge ? "(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 300px" : "(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 240px"}
          className="object-cover"
          priority={false}
        />
        
        {/* Drag handle indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10 transition-colors duration-200">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            Drag to reorder
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Points group component - displays stacked contestants with same points
 * Always shows all point values (0-5), even if empty
 * Seals are aligned horizontally at the same level
 */
function PointsGroup({ 
  points, 
  contestants 
}: { 
  points: number;
  contestants: ScoredContestant[];
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
      {/* Stacked contestant images */}
      <div className="w-full flex flex-col gap-2">
        {contestants.map((contestant) => (
          <SortableContestantImage 
            key={contestant.id} 
            contestant={contestant}
            isLarge={points === 5}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ContestantGallery Component
 * 
 * Displays a grid of draggable contestant images grouped by points.
 * Supports drag-and-drop reordering and stacking (multiple contestants per points value).
 * Scores are stored independently per series/episode/task combination.
 * 
 * @param seriesId - The series number to display
 * @param episodeId - The episode number to display
 * @param taskId - The task number to display
 */
export default function ContestantGallery({ seriesId, episodeId, taskId }: ContestantGalleryProps) {
  const { scoredContestants, contestantsByPoints, allPoints, isLoading, handleDragEnd } = useSeriesGallery(seriesId, episodeId, taskId);
  const [activeId, setActiveId] = useState<string | null>(null);

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
                <PointsGroup
                  key={points}
                  points={points}
                  contestants={contestantsByPoints[points] || []}
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

      <div className="mt-8 text-center text-sm text-zinc-500">
        <p>💡 Drag contestants to reorder or stack them on top of each other to share points.</p>
      </div>
    </div>
  );
}
