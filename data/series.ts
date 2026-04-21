/**
 * Series Data - Database-Backed Series List
 * 
 * Provides the list of all available series for the UI selector.
 * All contestant, episode, and task data is fetched from PostgreSQL via Server Actions.
 * 
 * Available series:
 * - Regular series: 1-20
 * - Champion of Champions: 101-104 (CoC 1-4)
 * - New Year's Treat: 201-206 (NYT 1-6)
 */

/**
 * All available series for selection
 */
export const ALL_SERIES = [
  // Regular series 1-20
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Series ${i + 1}`,
    displayName: `Series ${i + 1}`,
  })),
  // Champion of Champions 1-4
  { id: 101, name: 'Champion of Champions 1', displayName: 'CoC 1' },
  { id: 102, name: 'Champion of Champions 2', displayName: 'CoC 2' },
  { id: 103, name: 'Champion of Champions 3', displayName: 'CoC 3' },
  { id: 104, name: 'Champion of Champions 4', displayName: 'CoC 4' },
  // New Year's Treat 1-6
  { id: 201, name: "New Year's Treat 1", displayName: 'NYT 1' },
  { id: 202, name: "New Year's Treat 2", displayName: 'NYT 2' },
  { id: 203, name: "New Year's Treat 3", displayName: 'NYT 3' },
  { id: 204, name: "New Year's Treat 4", displayName: 'NYT 4' },
  { id: 205, name: "New Year's Treat 5", displayName: 'NYT 5' },
  { id: 206, name: "New Year's Treat 6", displayName: 'NYT 6' },
];

/**
 * All series IDs that have data in the PostgreSQL database
 */
export const SERIES_WITH_DB_DATA = [
  ...Array.from({ length: 20 }, (_, i) => i + 1), // 1-20
  101, 102, 103, 104, // CoC 1-4
  201, 202, 203, 204, 205, 206, // NYT 1-6
] as const;

/**
 * Get all series for selection dropdown
 * @returns Array of series with id, name, and display name
 */
export function getAllSeries() {
  return ALL_SERIES;
}

/**
 * Check if a series has data in the database
 * @param seriesId - The series number to check
 * @returns True if the series has database data, false otherwise
 */
export function hasDBData(seriesId: number): boolean {
  return (SERIES_WITH_DB_DATA as readonly number[]).includes(seriesId);
}
