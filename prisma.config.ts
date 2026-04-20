/**
 * Prisma Configuration
 *
 * Prisma 7 no longer auto-loads `.env` for CLI commands and no longer
 * defaults `datasource.url` to `env("DATABASE_URL")` in `schema.prisma`.
 * This file provides both:
 *   - loads variables from `.env` into `process.env` via `dotenv/config`
 *   - supplies the datasource URL to the Prisma CLI
 *
 * Commands affected: `prisma generate`, `prisma db push`, `prisma migrate`,
 * `prisma studio`, etc.
 *
 * The application code (Next.js server actions, scripts under `scripts/`,
 * and `prisma/import-csv.ts`) reads `DATABASE_URL` from `process.env`
 * directly, so no other files need to change.
 */

import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
