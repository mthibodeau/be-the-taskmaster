This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Drag & Drop Image Gallery**: Interactive image gallery with 5 placeholder images
- **Persistent Ordering**: Image order is saved to localStorage and persists across page refreshes
- **Accessible**: Full keyboard navigation support with ARIA labels
- **Responsive**: Works on desktop, tablet, and mobile devices with touch support
- **Modern Stack**: Built with React 19, Next.js 16, TypeScript, and Tailwind CSS

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

## Project Structure

```
/app
  page.tsx              # Main page with gallery
  layout.tsx            # Root layout
/components
  ImageGallery.tsx      # Drag-and-drop gallery component
/hooks
  useImageOrder.ts      # Custom hook for managing image state and localStorage
/types
  (inline types)        # TypeScript interfaces defined in hooks/useImageOrder.ts
```

## How It Works

- **useImageOrder Hook**: Custom React hook that manages image state, loads from localStorage on mount, and saves changes automatically
- **dnd-kit Library**: Modern drag-and-drop library with excellent accessibility and touch support
- **localStorage**: Browser storage API used to persist image order between sessions
- **Next.js Image**: Optimized image component with automatic lazy loading and responsive images

## Key Technologies

- **React 19**: Latest React with hooks and concurrent features
- **Next.js 16**: App Router, Server Components, and optimized bundling
- **TypeScript**: Type-safe development with full IntelliSense
- **Tailwind CSS**: Utility-first CSS framework
- **dnd-kit**: Accessible drag-and-drop library

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
