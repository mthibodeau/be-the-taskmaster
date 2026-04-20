import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma Client Singleton
 * 
 * Prisma 7 uses WASM engine by default which requires an adapter.
 * Using pg adapter for PostgreSQL compatibility.
 */

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Reuse pool in development to avoid "too many clients" errors
const pool = globalForPrisma.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

const prismaLogLevels: ConstructorParameters<typeof PrismaClient>[0]['log'] =
  process.env.NODE_ENV === 'production'
    ? ['error', 'warn']
    : ['query', 'error', 'warn'];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    adapter,
    log: prismaLogLevels,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
