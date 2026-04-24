'use client';

import UserInfo from '@/components/UserInfo';

export default function AppHeader() {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-full flex items-center justify-between px-4">
        <div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Taskmaster
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Official scores and guest rescoring
          </div>
        </div>

        <UserInfo />
      </div>
    </header>
  );
}

