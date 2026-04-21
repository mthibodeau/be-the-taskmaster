'use client';

import Image from 'next/image';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { ScoredContestant } from '@/types/contestant';
import clsx from 'clsx';

export function ContestantCard({
  contestant,
  isLarge = false,
  disabled = false,
}: {
  contestant: ScoredContestant;
  isLarge?: boolean;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contestant.id, disabled });

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
        'relative group rounded-lg',
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
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
          sizes={
            isLarge
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 300px'
              : '(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 240px'
          }
          className="object-cover"
          priority={false}
        />

        {!disabled ? (
          <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10 transition-colors duration-200">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Drag to reorder
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

