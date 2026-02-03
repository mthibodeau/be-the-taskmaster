This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Multi-Series Support**: Manage contestants across 20+ series
- **Drag & Drop Rankings**: Interactive ranking system with drag-and-drop reordering
- **Series Selection**: Easy dropdown to switch between series
- **Persistent Ordering**: Rankings saved to localStorage per series (persists across page refreshes)
- **Contestant Management**: Organized file structure ready for database integration
- **Accessible**: Full keyboard navigation support with ARIA labels
- **Responsive**: Works on desktop, tablet, and mobile devices with touch support
- **Modern Stack**: Built with React 19, Next.js 16, TypeScript, and Tailwind CSS

## Project Structure

```
/app
  page.tsx                    # Main page with series selection
  layout.tsx                  # Root layout
/components
  ContestantGallery.tsx       # Drag-and-drop contestant gallery
  SeriesSelector.tsx          # Series dropdown selector
/hooks
  useSeriesGallery.ts         # Custom hook for series-specific contestant management
/types
  contestant.ts               # TypeScript interfaces for Contestant and Series
/data
  series.ts                   # Series and contestant data (ready for DB migration)
/public/images
  series-01/                  # Contestant images organized by series
  series-02/
  ...
  NAMING-GUIDE.md            # Image naming conventions
```

## How It Works

### Architecture

- **Series-Based Organization**: Each series has its own folder with contestant images
- **Data Layer**: TypeScript interfaces and data files separate concerns from UI
- **useSeriesGallery Hook**: Manages series-specific contestant state and localStorage per series
- **dnd-kit Library**: Modern drag-and-drop library with excellent accessibility and touch support
- **localStorage**: Rankings saved per series using key: `contestant-order-series-{id}`
- **Next.js Image**: Optimized image component with automatic lazy loading and responsive images

### Adding a New Series

1. **Create series folder:**
   ```bash
   mkdir public/images/series-XX
   ```

2. **Add contestant images:**
   - Name files: `firstname-lastname.ext`
   - Use lowercase with hyphens
   - Example: `john-smith.png`

3. **Update data file** (`data/series.ts`):
   ```typescript
   {
     id: XX,
     name: 'Series XX',
     contestants: [
       {
         id: createContestantId(XX, 'Contestant Name'),
         name: 'Contestant Name',
         imageUrl: getImageUrl(XX, 'Contestant Name', 'png'),
         seriesId: XX,
       },
       // ... add 4 more contestants
     ]
   }
   ```

4. **Refresh the app** - new series appears in dropdown!

See `public/images/NAMING-GUIDE.md` for detailed conventions.

## Key Technologies

- **React 19**: Latest React with hooks and concurrent features
- **Next.js 16**: App Router, Server Components, and optimized bundling
- **TypeScript**: Type-safe development with full IntelliSense
- **Tailwind CSS v4**: Utility-first CSS framework
- **dnd-kit**: Accessible drag-and-drop library

## Future Enhancements

The current structure is designed to support:

- **Database Integration**: Data structure maps directly to SQL tables
- **Episode & Task Tracking**: Organize by episodes and tasks
- **User Rankings**: Multiple users can rank contestants per task
- **Statistics**: Analytics and performance metrics
- **API Routes**: Backend services for data persistence
- **Authentication**: User accounts and profiles

See `data/series.ts` for database schema examples.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
