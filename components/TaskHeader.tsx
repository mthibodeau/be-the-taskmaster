'use client';

export default function TaskHeader({
  episodeNumber,
  taskNumber,
  description,
}: {
  episodeNumber: number;
  taskNumber: number;
  description: string | null;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Episode {episodeNumber}
      </div>
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Task {taskNumber}
      </div>
      <div className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
        {description ?? 'No description available.'}
      </div>
    </div>
  );
}

