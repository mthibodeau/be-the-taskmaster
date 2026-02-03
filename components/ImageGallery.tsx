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
import { useImageOrder, ImageItem } from '@/hooks/useImageOrder';
import { useState } from 'react';

/**
 * Individual sortable image component
 * Wraps each image with drag-and-drop functionality
 */
function SortableImage({ image }: { image: ImageItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

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
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
        
        {/* Drag handle indicator */}
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
 * Main ImageGallery component
 * Displays a grid of draggable images with localStorage persistence
 */
export default function ImageGallery() {
  const { images, handleDragEnd } = useImageOrder();
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

  // Find the active image for the drag overlay
  const activeImage = activeId ? images.find((img) => img.id === activeId) : null;

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Drag & Drop Image Gallery
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Drag images to reorder them. Your arrangement will be saved automatically.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEndWrapper}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {images.map((image) => (
              <SortableImage key={image.id} image={image} />
            ))}
          </div>
        </SortableContext>

        {/* DragOverlay shows a copy of the dragged item that follows the cursor */}
        <DragOverlay>
          {activeImage ? (
            <div className="relative w-64 aspect-[225/266] overflow-hidden rounded-lg shadow-2xl opacity-90 cursor-grabbing">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                sizes="256px"
                className="object-cover"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <p>💡 Tip: Try refreshing the page - your order will be preserved!</p>
      </div>
    </div>
  );
}
