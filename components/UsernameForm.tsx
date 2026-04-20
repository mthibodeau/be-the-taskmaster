'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function UsernameForm() {
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(username);
      if (!result.success) setError(result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Username
      </label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. meg"
        className="h-9 w-48 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? '...' : 'Continue'}
      </button>
      {error ? (
        <span className="text-sm text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </form>
  );
}

