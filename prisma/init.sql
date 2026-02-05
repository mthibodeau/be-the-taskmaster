-- Taskmaster Database Schema (SQL version of schema.prisma)
-- This file matches the current Prisma schema and uses "scores" terminology

-- Create enums
CREATE TYPE "TaskFormat" AS ENUM ('TEAM', 'INDIVIDUAL');
CREATE TYPE "ScoringType" AS ENUM ('SUBJECTIVE', 'OBJECTIVE');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Series table
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contestants table
CREATE TABLE IF NOT EXISTS contestants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "contestants_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES series(id)
);

CREATE INDEX IF NOT EXISTS "contestants_seriesId_idx" ON contestants("seriesId");

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id SERIAL PRIMARY KEY,
    "seriesId" INTEGER NOT NULL,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT "episodes_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES series(id),
    UNIQUE("seriesId", number)
);

CREATE INDEX IF NOT EXISTS "episodes_seriesId_idx" ON episodes("seriesId");

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    "episodeId" INTEGER NOT NULL,
    "seriesId" INTEGER NOT NULL,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    "taskWording" TEXT,
    "taskFormat" "TaskFormat" NOT NULL DEFAULT 'INDIVIDUAL',
    "scoringType" "ScoringType" NOT NULL DEFAULT 'OBJECTIVE',
    "taskType" TEXT,
    location TEXT,
    "isPrizeTask" BOOLEAN NOT NULL DEFAULT false,
    "isLiveTask" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "tasks_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES episodes(id),
    CONSTRAINT "tasks_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES series(id),
    UNIQUE("episodeId", number)
);

CREATE INDEX IF NOT EXISTS "tasks_episodeId_idx" ON tasks("episodeId");
CREATE INDEX IF NOT EXISTS "tasks_seriesId_idx" ON tasks("seriesId");

-- Official Scores table (renamed from official_rankings)
CREATE TABLE IF NOT EXISTS official_scores (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL,
    "contestantId" TEXT NOT NULL,
    points INTEGER NOT NULL,
    notes TEXT,
    CONSTRAINT "official_scores_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES tasks(id),
    CONSTRAINT "official_scores_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES contestants(id),
    UNIQUE("taskId", "contestantId")
);

CREATE INDEX IF NOT EXISTS "official_scores_taskId_idx" ON official_scores("taskId");

-- User Scores table (renamed from user_rankings)
CREATE TABLE IF NOT EXISTS user_scores (
    id SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "contestantId" TEXT NOT NULL,
    points INTEGER NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id),
    CONSTRAINT "user_scores_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES tasks(id),
    CONSTRAINT "user_scores_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES contestants(id),
    UNIQUE("userId", "taskId", "contestantId")
);

CREATE INDEX IF NOT EXISTS "user_scores_userId_taskId_idx" ON user_scores("userId", "taskId");
