# Taskmaster Scoring App

A Next.js application for viewing and managing Taskmaster contestant scores across all series, including Champion of Champions and New Year's Treat specials.

## Features

- **Database-Backed Scoring**: PostgreSQL database with official scores from the show
- **Multi-Series Support**: Regular series (1-20), Champion of Champions (CoC1-4), New Year's Treat (NYT1-6)
- **Interactive Rankings**: Drag-and-drop interface for exploring and customizing scores
- **Episode & Task Navigation**: Browse by series, episode, and individual task
- **Points-Based System**: Displays actual points (0-5+), including DQ and bonus points
- **Modern Stack**: React 19, Next.js 16, TypeScript, Prisma 7, PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for PostgreSQL)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**
   ```bash
   docker run --name taskmaster-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=taskmaster \
     -p 5432:5432 \
     -d postgres:16
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmaster"
   ```

4. **Initialize database:**
   ```bash
   # Run Prisma migrations
   npx prisma generate
   npx prisma db push
   
   # Import data from CSV files
   npx tsx prisma/import-csv.ts
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /actions
    fetch-scores.ts           # Server Actions for secure data fetching
  page.tsx                    # Main page with series/episode/task selection
  layout.tsx                  # Root layout
  
/components
  ContestantGallery.tsx       # Drag-and-drop gallery with dnd-kit
  EpisodeTaskSidebar.tsx      # Episode and task navigation
  PointsSeal.tsx              # Points display component
  SeriesSelector.tsx          # Series dropdown
  /ui                         # Radix UI components
  
/hooks
  useSeriesGallery.ts         # Main hook for contestant state and drag-drop
  
/lib
  prisma.ts                   # Prisma Client singleton with connection pooling
  db.ts                       # Database query layer (server-only)
  utils.ts                    # Utility functions
  
/types
  contestant.ts               # TypeScript interfaces for contestants and scores
  episode.ts                  # TypeScript interfaces for episodes and tasks
  
/data
  series.ts                   # Static data for series without database mappings
  episodes.ts                 # Static episode data (fallback)
  
/prisma
  schema.prisma               # Database schema
  init.sql                    # SQL version of schema
  import-csv.ts               # CSV import script
  seed.ts                     # Database seeding
  
/public/images
  /series-04                  # Contestant images by series
  /series-05
  blank-seal.png              # Points seal background
```

## Architecture

### Data Flow

```
PostgreSQL Database
       ↓
  Prisma Client (lib/prisma.ts)
       ↓
  Database Layer (lib/db.ts)
       ↓
  Server Actions (app/actions/fetch-scores.ts)
       ↓
  React Hook (hooks/useSeriesGallery.ts)
       ↓
  UI Components (components/)
```

### Key Technologies

- **Next.js 16**: App Router with Server Actions
- **React 19**: Modern hooks and concurrent features
- **TypeScript**: Full type safety
- **Prisma 7**: Type-safe ORM with WASM engine
- **PostgreSQL**: Relational database
- **Tailwind CSS v4**: Utility-first styling
- **dnd-kit**: Accessible drag-and-drop
- **Radix UI**: Accessible component primitives

## Database Schema

### Core Models
- **Series**: Taskmaster series/seasons
- **Contestant**: Participants (linked to series)
- **Episode**: Episodes within series
- **Task**: Individual tasks within episodes

### Scoring Models
- **OfficialScore**: Canonical scores from the show
  - `points`: 0 (DQ), 1-5 (standard), >5 (bonus)
  - `notes`: Additional context (e.g., "Disqualified", "Tie")
- **UserScore**: User customizations (future feature)

## CSV Data Import

The app imports data from three CSV files:

1. **`taskmaster_tasks.csv`** - Regular series (1-20)
2. **`taskmaster__coc_tasks.csv`** - Champion of Champions
3. **`taskmaster_nyt_tasks.csv`** - New Year's Treat specials

**Import command:**
```bash
npx tsx prisma/import-csv.ts
```

This will:
1. Clear existing data
2. Import episodes and tasks
3. Insert official scores for all contestants

## Adding New Series

Currently, only Series 4 and 5 have contestant mappings. To add more:

1. **Add contestant images:**
   ```bash
   mkdir public/images/series-XX
   # Add images: firstname-lastname.png
   ```

2. **Update contestant mappings:**
   Edit `prisma/import-csv.ts`:
   ```typescript
   const CONTESTANT_MAPPINGS: Record<string, string[]> = {
     '4': ['s4-hugh-dennis', 's4-joe-lycett', ...],
     '5': ['s5-aisling-bea', 's5-bob-mortimer', ...],
     'XX': ['sXX-contestant-1', 'sXX-contestant-2', ...], // Add new series
   };
   ```

3. **Re-import data:**
   ```bash
   npx tsx prisma/import-csv.ts
   ```

## Testing

### Test Database Connection
```bash
npx tsx scripts/test-db.ts
```

### Direct Database Queries
```bash
# Connect to database
docker exec -it taskmaster-postgres psql -U postgres -d taskmaster

# Check data
SELECT COUNT(*) FROM episodes;
SELECT COUNT(*) FROM official_scores;

# View scores for a specific task
SELECT c.name, os.points FROM official_scores os
JOIN contestants c ON c.id = os."contestantId"
WHERE os."taskId" = 1
ORDER BY os.points DESC;
```

## Hybrid Data Architecture

The app uses a **hybrid approach**:
- **Series with database mappings** (4, 5): Fetch from PostgreSQL
- **Series without mappings**: Use static data from `data/series.ts`

Check if series uses database:
```typescript
import { hasDBData } from '@/data/series';

if (hasDBData(seriesId)) {
  // Use database
} else {
  // Use static data
}
```

## Future Enhancements

- [ ] User authentication
- [ ] Save user custom scores to database
- [ ] Contestant mappings for all series
- [ ] Statistics and analytics
- [ ] Series-wide scoreboard
- [ ] Search and filtering
- [ ] Mobile app

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Taskmaster Wiki](https://taskmaster.fandom.com/wiki/Taskmaster_Wiki)

## License

This project is for educational purposes. Taskmaster is a trademark of Avalon Television.
