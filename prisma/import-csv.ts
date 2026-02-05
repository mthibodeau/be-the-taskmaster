/**
 * CSV Import Script for Taskmaster Scores Database
 * 
 * Imports data from six CSV files:
 * - taskmaster_contestants.csv (regular series contestants)
 * - coc_contestants.csv (Champion of Champions contestants)
 * - nyt_contestants.csv (New Year's Treat contestants)
 * - taskmaster_tasks.csv (regular series 1-20)
 * - taskmaster__coc_tasks.csv (Champion of Champions series)
 * - taskmaster_nyt_tasks.csv (New Year's Treat specials)
 * 
 * Uses direct SQL queries to avoid Prisma adapter transaction issues.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });

interface CSVRow {
  Series: string;
  EpisodeNumber: string;
  EpisodeTitle: string;
  AirDate: string;
  TaskNumber: string;
  Description: string;
  IsLive: string;
  IsTeam: string;
  IsPrize: string;
  Contestant1: string;
  Contestant2: string;
  Contestant3: string;
  Contestant4: string;
  Contestant5: string;
}

/**
 * Generate contestant ID from name
 * Format: s{series}-firstname-lastname
 */
function createContestantId(seriesId: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (seriesId.startsWith('CoC')) {
    return `coc${seriesId.replace('CoC', '')}-${slug}`;
  } else if (seriesId.startsWith('NYT')) {
    return `nyt${seriesId.replace('NYT', '')}-${slug}`;
  } else {
    return `s${seriesId}-${slug}`;
  }
}

/**
 * Generate image URL for contestant
 */
function getImageUrl(seriesId: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  let seriesFolder: string;
  if (seriesId.startsWith('CoC')) {
    seriesFolder = `coc-${seriesId.replace('CoC', '')}`;
  } else if (seriesId.startsWith('NYT')) {
    seriesFolder = `nyt-${seriesId.replace('NYT', '')}`;
  } else {
    seriesFolder = `series-${String(seriesId).padStart(2, '0')}`;
  }
  
  return `/images/${seriesFolder}/${slug}.png`;
}

/**
 * Load contestants from all CSV files
 */
function loadContestants(): Map<string, string[]> {
  const contestantsBySeries = new Map<string, string[]>();
  
  // Load regular series contestants
  const regularPath = path.join(process.cwd(), 'taskmaster_contestants.csv');
  if (fs.existsSync(regularPath)) {
    const content = fs.readFileSync(regularPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    for (const row of records) {
      const seriesId = row.series;
      if (!contestantsBySeries.has(seriesId)) {
        contestantsBySeries.set(seriesId, []);
      }
      contestantsBySeries.get(seriesId)!.push(row.contestant);
    }
  } else {
    console.log('⚠️  taskmaster_contestants.csv not found\n');
  }
  
  // Load Champion of Champions contestants
  const cocPath = path.join(process.cwd(), 'coc_contestants.csv');
  if (fs.existsSync(cocPath)) {
    const content = fs.readFileSync(cocPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    for (const row of records) {
      const seriesId = row.ChampionOfChampions;
      if (!contestantsBySeries.has(seriesId)) {
        contestantsBySeries.set(seriesId, []);
      }
      contestantsBySeries.get(seriesId)!.push(row.ContestantName);
    }
  } else {
    console.log('⚠️  coc_contestants.csv not found\n');
  }
  
  // Load New Year's Treat contestants
  const nytPath = path.join(process.cwd(), 'nyt_contestants.csv');
  if (fs.existsSync(nytPath)) {
    const content = fs.readFileSync(nytPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    for (const row of records) {
      const seriesId = row.TreatNumber;
      if (!contestantsBySeries.has(seriesId)) {
        contestantsBySeries.set(seriesId, []);
      }
      contestantsBySeries.get(seriesId)!.push(row.ContestantName);
    }
  } else {
    console.log('⚠️  nyt_contestants.csv not found\n');
  }
  
  return contestantsBySeries;
}

/**
 * Create or update contestants for a series
 */
async function ensureContestants(
  seriesId: string,
  seriesNumber: number,
  contestantNames: string[]
): Promise<string[]> {
  const contestantIds: string[] = [];
  
  for (let i = 0; i < contestantNames.length; i++) {
    const name = contestantNames[i];
    const contestantId = createContestantId(seriesId, name);
    const imageUrl = getImageUrl(seriesId, name);
    
    await pool.query(
      `INSERT INTO contestants (id, name, "imageUrl", "seriesId", "displayOrder")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name,
           "imageUrl" = EXCLUDED."imageUrl",
           "displayOrder" = EXCLUDED."displayOrder"`,
      [contestantId, name, imageUrl, seriesNumber, i + 1]
    );
    
    contestantIds.push(contestantId);
  }
  
  return contestantIds;
}

/**
 * Parse CSV file into rows
 */
function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  return records as CSVRow[];
}

/**
 * Parse points value from CSV
 */
function parsePointsValue(value: string): { points: number | null; notes: string | null } {
  const trimmed = value.trim();
  
  if (trimmed === '' || trimmed === '-' || trimmed === '–') {
    return { points: null, notes: 'Not applicable' };
  }
  
  if (trimmed.toUpperCase() === 'DQ') {
    return { points: 0, notes: 'Disqualified' };
  }
  
  const bracketMatch = trimmed.match(/^(\d+)\[(\d+)\]$/);
  if (bracketMatch) {
    return { points: parseInt(bracketMatch[1]), notes: `Tie (variant ${bracketMatch[2]})` };
  }
  
  const numericPoints = parseInt(trimmed);
  if (!isNaN(numericPoints)) {
    return { points: numericPoints, notes: null };
  }
  
  console.warn(`Unknown points format: "${trimmed}"`);
  return { points: null, notes: `Unknown: ${trimmed}` };
}

/**
 * Parse boolean from CSV
 */
function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

/**
 * Clear all data from the database
 */
async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');
  
  const tablesToClear = [
    'official_scores',
    'official_rankings',
    'user_scores',
    'user_rankings',
    'tasks',
    'episodes',
    'contestants',
    'series'
  ];
  
  for (const table of tablesToClear) {
    try {
      const result = await pool.query(`DELETE FROM ${table}`);
      if (result.rowCount !== null && result.rowCount > 0) {
        console.log(`   Cleared ${table} (${result.rowCount} rows)`);
      }
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.error(`   ❌ Error clearing ${table}: ${e.code} - ${e.message}`);
      }
    }
  }
  
  console.log('✅ Database cleared\n');
}

/**
 * Create series entry
 */
async function ensureSeries(seriesId: string, seriesNumber: number): Promise<void> {
  let seriesName: string;
  
  if (seriesId.startsWith('CoC')) {
    seriesName = `Champion of Champions ${seriesId.replace('CoC', '')}`;
  } else if (seriesId.startsWith('NYT')) {
    seriesName = `New Year's Treat ${seriesId.replace('NYT', '')}`;
  } else {
    seriesName = `Series ${seriesId}`;
  }
  
  await pool.query(
    `INSERT INTO series (id, name, "displayName")
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
    [seriesNumber, seriesName, seriesName]
  );
}

/**
 * Import data from a single CSV file
 */
async function importFile(
  csvPath: string,
  contestantsBySeries: Map<string, string[]>,
  stats: { 
    seriesCreated: number; 
    contestantsCreated: number; 
    episodesCreated: number; 
    tasksCreated: number; 
    scoresCreated: number;
    skipped: number;
  }
) {
  console.log(`📂 Reading ${path.basename(csvPath)}...`);
  const rows = parseCSV(csvPath);
  console.log(`   Found ${rows.length} tasks\n`);
  
  const episodeCache = new Map<string, number>();
  const seriesCache = new Set<string>();
  const contestantCache = new Map<string, string[]>();
  
  for (const row of rows) {
    const seriesId = row.Series;
    const episodeNumber = parseInt(row.EpisodeNumber);
    const taskNumber = parseInt(row.TaskNumber);
    
    // Convert series ID to number
    let seriesNumber: number;
    if (seriesId.startsWith('CoC')) {
      seriesNumber = 100 + parseInt(seriesId.replace('CoC', ''));
    } else if (seriesId.startsWith('NYT')) {
      seriesNumber = 200 + parseInt(seriesId.replace('NYT', ''));
    } else {
      seriesNumber = parseInt(seriesId);
    }
    
    try {
      // 1. Ensure series exists
      if (!seriesCache.has(seriesId)) {
        await ensureSeries(seriesId, seriesNumber);
        seriesCache.add(seriesId);
        stats.seriesCreated++;
      }
      
      // 2. Ensure contestants exist for this series
      if (!contestantCache.has(seriesId)) {
        const contestantNames = contestantsBySeries.get(seriesId);
        if (!contestantNames) {
          console.error(`❌ No contestants found for series ${seriesId}, skipping...`);
          stats.skipped++;
          continue;
        }
        const contestantIds = await ensureContestants(seriesId, seriesNumber, contestantNames);
        contestantCache.set(seriesId, contestantIds);
        stats.contestantsCreated += contestantIds.length;
      }
      
      // 3. Get or create episode
      const episodeKey = `${seriesId}-${episodeNumber}`;
      let episodeId = episodeCache.get(episodeKey);
      
      if (!episodeId) {
        const episodeResult = await pool.query(
          `INSERT INTO episodes ("seriesId", number, name)
           VALUES ($1, $2, $3)
           ON CONFLICT ("seriesId", number) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [seriesNumber, episodeNumber, row.EpisodeTitle]
        );
        episodeId = episodeResult.rows[0]?.id as number;
        episodeCache.set(episodeKey, episodeId);
        stats.episodesCreated++;
      }
      
      // 4. Create task
      const taskFormat = parseBoolean(row.IsTeam) ? 'TEAM' : 'INDIVIDUAL';
      const isPrizeTask = parseBoolean(row.IsPrize);
      const isLiveTask = parseBoolean(row.IsLive);
      
      const taskResult = await pool.query(
        `INSERT INTO tasks ("episodeId", "seriesId", number, name, description, "taskFormat", "isPrizeTask", "isLiveTask")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT ("episodeId", number) DO UPDATE 
         SET description = EXCLUDED.description,
             "taskFormat" = EXCLUDED."taskFormat",
             "isPrizeTask" = EXCLUDED."isPrizeTask",
             "isLiveTask" = EXCLUDED."isLiveTask"
         RETURNING id`,
        [episodeId, seriesNumber, taskNumber, `Task ${taskNumber}`, row.Description, taskFormat, isPrizeTask, isLiveTask]
      );
      const taskId = taskResult.rows[0]?.id as number;
      stats.tasksCreated++;
      
      // 5. Create official scores
      const contestantIds = contestantCache.get(seriesId)!;
      const pointsValues = [
        row.Contestant1,
        row.Contestant2,
        row.Contestant3,
        row.Contestant4,
        row.Contestant5,
      ];
      
      for (let i = 0; i < Math.min(contestantIds.length, pointsValues.length); i++) {
        const contestantId = contestantIds[i];
        const { points, notes } = parsePointsValue(pointsValues[i]);
        
        if (points === null && notes === 'Not applicable') {
          continue;
        }
        
        if (points === null) {
          console.warn(`⚠️  Skipping score for ${seriesId}E${episodeNumber}T${taskNumber} contestant ${i+1}: points is null`);
          stats.skipped++;
          continue;
        }
        
        await pool.query(
          `INSERT INTO official_scores ("taskId", "contestantId", points, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT ("taskId", "contestantId") DO UPDATE
           SET points = EXCLUDED.points,
               notes = EXCLUDED.notes`,
          [taskId, contestantId, points, notes]
        );
        stats.scoresCreated++;
      }
      
    } catch (error) {
      console.error(`❌ Error importing ${seriesId}E${episodeNumber}T${taskNumber}:`, error);
      throw error;
    }
  }
}

/**
 * Main import function
 */
async function importCSV() {
  await clearDatabase();
  
  // Load contestants first
  console.log('📖 Loading contestants...\n');
  const contestantsBySeries = loadContestants();
  console.log(`   Found contestants for ${contestantsBySeries.size} series\n`);
  
  const stats = {
    seriesCreated: 0,
    contestantsCreated: 0,
    episodesCreated: 0,
    tasksCreated: 0,
    scoresCreated: 0,
    skipped: 0
  };
  
  const files = [
    'taskmaster_tasks.csv',
    'taskmaster__coc_tasks.csv',
    'taskmaster_nyt_tasks.csv'
  ];
  
  for (const file of files) {
    const csvPath = path.join(process.cwd(), file);
    if (fs.existsSync(csvPath)) {
      await importFile(csvPath, contestantsBySeries, stats);
    } else {
      console.log(`⚠️  File not found: ${file}\n`);
    }
  }
  
  console.log('\n✅ Import complete!');
  console.log(`   Series: ${stats.seriesCreated}`);
  console.log(`   Contestants: ${stats.contestantsCreated}`);
  console.log(`   Episodes: ${stats.episodesCreated}`);
  console.log(`   Tasks: ${stats.tasksCreated}`);
  console.log(`   Scores: ${stats.scoresCreated}`);
  if (stats.skipped > 0) {
    console.log(`   Skipped: ${stats.skipped}`);
  }
}

// Run the import
importCSV()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
