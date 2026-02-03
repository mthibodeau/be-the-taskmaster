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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSeriesGallery } from '@/hooks/useSeriesGallery';
import { useState } from 'react';
import { Contestant } from '@/types/contestant';

interface ContestantGalleryProps {
  /** The series ID to display contestants for */
  seriesId: number;
}

/**
 * Individual sortable contestant component
 * Wraps each contestant image with drag-and-drop functionality
 */
function SortableContestant({ contestant }: { contestant: Contestant }) {
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
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="relative w-full aspect-[225/266] overflow-hidden rounded-lg transition-all duration-200 hover:shadow-lg">
        <Image
          src={contestant.imageUrl}
          alt={contestant.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 240px"
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
      
      {/* Contestant name below image */}
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {contestant.name}
        </p>
      </div>
    </div>
  );
}

/**
 * ContestantGallery Component
 * 
 * Displays a grid of draggable contestant images for a specific series.
 * Supports drag-and-drop reordering with localStorage persistence.
 * 
 * @param seriesId - The series number to display
 */
export default function ContestantGallery({ seriesId }: ContestantGalleryProps) {
  const { contestants, isLoading, handleDragEnd } = useSeriesGallery(seriesId);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag detection
  // PointerSensor handles mouse/touch, KeyboardSensor handles keyboard navigation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
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
    ? contestants.find((c) => c.id === activeId)
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

  if (contestants.length === 0) {
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
          items={contestants.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {contestants.map((contestant) => (
              <SortableContestant key={contestant.id} contestant={contestant} />
            ))}
          </div>
        </SortableContext>

        {/* DragOverlay shows a copy of the dragged item that follows the cursor */}
        <DragOverlay>
          {activeContestant ? (
            <div className="relative w-48 aspect-[225/266] overflow-hidden rounded-lg shadow-2xl opacity-90 cursor-grabbing">
              <Image
                src={activeContestant.imageUrl}
                alt={activeContestant.name}
                fill
                sizes="192px"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-1 text-sm font-medium">
                {activeContestant.name}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <p>💡 Drag contestants to reorder them. Your arrangement will be saved automatically.</p>
      </div>
    </div>
  );
}
