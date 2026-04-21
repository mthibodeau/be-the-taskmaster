'use client';

import UsernameForm from '@/components/UsernameForm';
import { useUser } from '@/contexts/UserContext';

export default function UserInfo() {
  const { user, logout } = useUser();

  if (user.status === 'anonymous') {
    return <UsernameForm />;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {user.username}
        </span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        Switch user
      </button>
    </div>
  );
}

