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
 * Represents a contestant with their score from a task
 * Contestants are grouped by points (5, 4, 3, 2, 1, 0 for DQ)
 */
export interface ScoredContestant extends Contestant {
  /** Points scored in the task (5 = best, 0 = disqualified, can be >5 with bonus) */
  points: number;
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
 * Official score from database
 * Represents the actual, canonical score from the show
 */
export interface OfficialScore {
  /** ID of the contestant */
  contestantId: string;
  
  /** Points awarded for this task */
  points: number;
  
  /** Additional notes about the score (e.g., "Disqualified", "Tie with 2 others") */
  notes: string | null;
}

/**
 * Task with full score data from database
 * Used when fetching complete task information including all scores
 */
export interface TaskWithScores {
  /** Database ID of the task */
  id: number;
  
  /** ID of the episode this task belongs to */
  episodeId: number;
  
  /** ID of the series this task belongs to */
  seriesId: number;
  
  /** Task number within the episode (1-5 typically) */
  number: number;
  
  /** Display name of the task */
  name: string;
  
  /** Detailed description of the task */
  description: string | null;
  
  /** Exact wording given to contestants */
  taskWording: string | null;
  
  /** Whether this is a prize task */
  isPrizeTask: boolean;
  
  /** Whether this is a live task */
  isLiveTask: boolean;
  
  /** Array of official scores for this task */
  officialScores: OfficialScore[];
}
