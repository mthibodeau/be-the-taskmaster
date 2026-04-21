'use client';

import clsx from 'clsx';

export function GalleryControls({
  userId,
  viewMode,
  setViewMode,
  isDirty,
  onResetToOfficial,
  onSave,
}: {
  userId?: string;
  viewMode: 'user' | 'official';
  setViewMode: (mode: 'user' | 'official') => void;
  isDirty: boolean;
  onResetToOfficial: () => void;
  onSave: () => Promise<{ success: true } | { success: false; error: string }>;
}) {
  return (
    <div
      className={clsx(
        'mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3',
        viewMode === 'user'
          ? 'border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setViewMode('user')}
            disabled={!userId}
            className={clsx(
              'h-8 rounded px-3 text-sm font-medium disabled:opacity-50',
              viewMode === 'user'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            )}
          >
            My Scores
          </button>
          <button
            type="button"
            onClick={() => setViewMode('official')}
            className={clsx(
              'h-8 rounded px-3 text-sm font-medium',
              viewMode === 'official'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            )}
          >
            Official
          </button>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {viewMode === 'official'
            ? 'Viewing official scores'
            : isDirty
              ? 'Unsaved changes'
              : 'Saved'}
        </div>
      </div>

      {userId && viewMode === 'user' ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetToOfficial}
            className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Reset to official
          </button>
          <button
            type="button"
            disabled={!isDirty}
            onClick={async () => {
              const result = await onSave();
              if (!result.success) {
                alert(result.error);
              }
            }}
            className="h-8 rounded-md bg-blue-600 px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}

