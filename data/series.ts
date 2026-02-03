import { Series, getImageUrl, createContestantId } from '@/types/contestant';

/**
 * Series data containing all contestants organized by series
 * 
 * This file serves as the central source of truth for series and contestant data.
 * In the future, this will be replaced with database/API calls.
 * 
 * To add a new series:
 * 1. Create folder: /public/images/series-XX/
 * 2. Add contestant images with name-based filenames
 * 3. Add series entry below
 * 4. Array order determines display order
 */

export const SERIES_DATA: Series[] = [
  {
    id: 4,
    name: 'Series 4',
    displayName: 'Series 4',
    contestants: [
      {
        id: createContestantId(4, 'Hugh Dennis'),
        name: 'Hugh Dennis',
        imageUrl: getImageUrl(4, 'Hugh Dennis', 'png'),
        seriesId: 4,
      },
      {
        id: createContestantId(4, 'Joe Lycett'),
        name: 'Joe Lycett',
        imageUrl: getImageUrl(4, 'Joe Lycett', 'png'),
        seriesId: 4,
      },
      {
        id: createContestantId(4, 'Lolly Adefope'),
        name: 'Lolly Adefope',
        imageUrl: getImageUrl(4, 'Lolly Adefope', 'png'),
        seriesId: 4,
      },
      {
        id: createContestantId(4, 'Mel Giedroyc'),
        name: 'Mel Giedroyc',
        imageUrl: getImageUrl(4, 'Mel Giedroyc', 'png'),
        seriesId: 4,
      },
      {
        id: createContestantId(4, 'Noel Fielding'),
        name: 'Noel Fielding',
        imageUrl: getImageUrl(4, 'Noel Fielding', 'png'),
        seriesId: 4,
      },
    ],
  },
  {
    id: 5,
    name: 'Series 5',
    displayName: 'Series 5',
    contestants: [
      {
        id: createContestantId(5, 'Aisling Bea'),
        name: 'Aisling Bea',
        imageUrl: getImageUrl(5, 'Aisling Bea', 'png'),
        seriesId: 5,
      },
      {
        id: createContestantId(5, 'Bob Mortimer'),
        name: 'Bob Mortimer',
        imageUrl: getImageUrl(5, 'Bob Mortimer', 'png'),
        seriesId: 5,
      },
      {
        id: createContestantId(5, 'Mark Watson'),
        name: 'Mark Watson',
        imageUrl: getImageUrl(5, 'Mark Watson', 'png'),
        seriesId: 5,
      },
      {
        id: createContestantId(5, 'Nish Kumar'),
        name: 'Nish Kumar',
        imageUrl: getImageUrl(5, 'Nish Kumar', 'png'),
        seriesId: 5,
      },
      {
        id: createContestantId(5, 'Sally Phillips'),
        name: 'Sally Phillips',
        imageUrl: getImageUrl(5, 'Sally Phillips', 'png'),
        seriesId: 5,
      },
    ],
  },
];

/**
 * Get a series by ID
 * @param seriesId - The series number to retrieve
 * @returns The series object or undefined if not found
 */
export function getSeriesById(seriesId: number): Series | undefined {
  return SERIES_DATA.find((series) => series.id === seriesId);
}

/**
 * Get all available series IDs
 * @returns Array of all series IDs
 */
export function getAllSeriesIds(): number[] {
  return SERIES_DATA.map((series) => series.id);
}

/**
 * Get all series for selection dropdown
 * @returns Array of series with id and display name
 */
export function getAllSeries(): Array<{ id: number; name: string; displayName?: string }> {
  return SERIES_DATA.map((series) => ({
    id: series.id,
    name: series.name,
    displayName: series.displayName,
  }));
}
