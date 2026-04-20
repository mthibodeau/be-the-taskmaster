'use server';

import { upsertUserByUsername } from '@/lib/db.server';

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function normalizeUsername(username: string): string | null {
  const normalized = username.trim();
  if (normalized.length < 1 || normalized.length > 32) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(normalized)) return null;
  return normalized;
}

export async function loginOrCreateUserAction(
  username: string
): Promise<
  | { success: true; data: { id: string; username: string } }
  | { success: false; error: string }
> {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    return {
      success: false,
      error: 'Username must be 1-32 characters and contain only letters, numbers, underscores, or dashes.',
    };
  }

  try {
    const user = await upsertUserByUsername(normalized);
    return { success: true, data: user };
  } catch (error) {
    console.error('loginOrCreateUserAction failed', { username: normalized, error });
    return { success: false, error: toErrorMessage(error, 'Failed to create user') };
  }
}

