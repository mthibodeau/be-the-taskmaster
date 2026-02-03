/**
 * Type definitions for contestants and series
 * These interfaces define the structure for managing contestants across multiple series
 */

/**
 * Represents a single contestant in a series
 */
export interface Contestant {
  /** Unique identifier (e.g., "s1-john-smith") */
  id: string;
  
  /** Display name (e.g., "John Smith") */
  name: string;
  
  /** Path to contestant image (e.g., "/images/series-01/john-smith.jpg") */
  imageUrl: string;
  
  /** Which series this contestant belongs to */
  seriesId: number;
}

/**
 * Represents a series/season with its contestants
 */
export interface Series {
  /** Series number (1, 2, 3, etc.) */
  id: number;
  
  /** Display name (e.g., "Series 1") */
  name: string;
  
  /** Optional full name with year (e.g., "Series 1 (2015)") */
  displayName?: string;
  
  /** Array of contestants in display order */
  contestants: Contestant[];
}

/**
 * Helper function to generate image URL from series ID and contestant name
 * @param seriesId - The series number
 * @param contestantName - The contestant's full name
 * @param extension - File extension (default: 'jpg')
 * @returns Formatted image URL path
 */
export function getImageUrl(
  seriesId: number, 
  contestantName: string,
  extension: string = 'jpg'
): string {
  const slug = contestantName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  const seriesFolder = `series-${String(seriesId).padStart(2, '0')}`;
  return `/images/${seriesFolder}/${slug}.${extension}`;
}

/**
 * Helper function to create a contestant ID from series and name
 * @param seriesId - The series number
 * @param contestantName - The contestant's full name
 * @returns Formatted contestant ID
 */
export function createContestantId(seriesId: number, contestantName: string): string {
  const slug = contestantName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return `s${seriesId}-${slug}`;
}
