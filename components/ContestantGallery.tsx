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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSeriesGallery } from '@/hooks/useSeriesGallery';
import { useState } from 'react';
import { RankedContestant } from '@/types/contestant';

interface ContestantGalleryProps {
  /** The series ID to display contestants for */
  seriesId: number;
}

/**
 * Individual sortable contestant image (no seal, just the image)
 * Used within a rank group
 */
function SortableContestantImage({ 
  contestant,
  isLarge = false
}: { 
  contestant: RankedContestant;
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
      className={`relative group cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      } ${isLarge ? 'scale-125' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="relative w-full aspect-[225/266] overflow-hidden rounded-lg transition-all duration-200 hover:shadow-lg">
        <Image
          src={contestant.imageUrl}
          alt={contestant.name}
          fill
          sizes={isLarge ? "(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 300px" : "(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 240px"}
          className="object-cover"
          priority={false}
        />
        
        {/* Drag handle indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-200">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            Drag to reorder
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Rank group component - displays stacked contestants with a single seal
 * Always shows all 5 ranks, even if empty
 * Seals are aligned horizontally at the same level
 */
function RankGroup({ 
  rank, 
  contestants 
}: { 
  rank: number;
  contestants: RankedContestant[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `rank-${rank}`,
  });

  const isEmpty = contestants.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center rounded-lg transition-colors ${
        isOver ? 'bg-zinc-100 dark:bg-zinc-900' : ''
      }`}
    >
      {/* Stacked contestant images */}
      <div className="w-full space-y-2">
        {contestants.map((contestant) => (
          <SortableContestantImage 
            key={contestant.id} 
            contestant={contestant}
            isLarge={rank === 5}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ContestantGallery Component
 * 
 * Displays a grid of draggable contestant images grouped by rank.
 * Supports drag-and-drop reordering and stacking (multiple contestants per rank).
 * 
 * @param seriesId - The series number to display
 */
export default function ContestantGallery({ seriesId }: ContestantGalleryProps) {
  const { rankedContestants, contestantsByRank, allRanks, isLoading, handleDragEnd } = useSeriesGallery(seriesId);
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEndWrapper = (event: any) => {
    setActiveId(null);
    handleDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find the active contestant for the drag overlay
  const activeContestant = activeId
    ? rankedContestants.find((c) => c.id === activeId)
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

  if (rankedContestants.length === 0) {
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
          items={[...rankedContestants.map((c) => c.id), ...allRanks.map((r) => `rank-${r}`)]}
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-end">
            {/* Disqualified (rank 0) - on the left */}
            <RankGroup
              key={0}
              rank={0}
              contestants={contestantsByRank[0] || []}
            />
            {/* Ranks 1-5 */}
            {allRanks.filter((r) => r !== 0).map((rank) => {
              const contestants = contestantsByRank[rank] || [];
              return (
                <RankGroup
                  key={rank}
                  rank={rank}
                  contestants={contestants}
                />
              );
            })}
          </div>
          
          {/* Seals row - aligned horizontally below all content */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mt-6">
            {/* Disqualified seal */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/images/blank-seal.png"
                  alt="Disqualified"
                  fill
                  sizes="64px"
                  className="object-contain"
                  priority={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl font-bold drop-shadow-lg">DQ</span>
                </div>
              </div>
            </div>
            {/* Rank seals 1-5 */}
            {allRanks.filter((r) => r !== 0).map((rank) => (
              <div key={rank} className="flex justify-center">
                <div className="relative w-16 h-16">
                  <Image
                    src="/images/blank-seal.png"
                    alt={`Rank ${rank}`}
                    fill
                    sizes="64px"
                    className="object-contain"
                    priority={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xl font-bold drop-shadow-lg">{rank}</span>
                  </div>
                </div>
              </div>
            ))}
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

      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <p>💡 Drag contestants to reorder or stack them on top of each other to share a rank.</p>
      </div>
    </div>
  );
}
