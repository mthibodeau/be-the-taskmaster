'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PointsSealProps {
  /** The points scored (0 for disqualified, 1-5 standard, can be >5 with bonus) */
  points: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * PointsSeal Component
 * 
 * Displays a seal image with points or "DQ" for disqualified contestants.
 * Shows actual points scored (including bonus points >5).
 * 
 * @param points - The points scored (displayed on seal)
 * @param className - Optional additional CSS classes to apply
 */
export default function PointsSeal({ points, className }: PointsSealProps) {
  // Show "DQ" for disqualified (0 points)
  const label = points === 0 ? 'DQ' : String(points);
  const altText = points === 0 ? 'Disqualified' : `${points} points`;

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative size-16">
        <Image
          src="/images/blank-seal.png"
          alt={altText}
          fill
          sizes="64px"
          className="object-contain"
          priority={false}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-bold drop-shadow-lg">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
