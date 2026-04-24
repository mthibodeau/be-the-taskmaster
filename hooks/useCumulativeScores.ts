import { useEffect, useState } from 'react';
import { fetchCumulativeScoresAction } from '@/app/actions/fetch-cumulative-scores';
import { fetchContestantsAction } from '@/app/actions/fetch-scores';

export type CumulativeTotals = {
  contestantId: string;
  officialTotal: number;
  userTotal: number;
};

type UseCumulativeScoresState =
  | { status: 'loading' }
  | {
      status: 'loaded';
      contestants: Array<{ id: string; name: string }>;
      episodeTotals: CumulativeTotals[];
      seriesTotals: CumulativeTotals[];
      episodeMax: number;
      seriesMax: number;
    }
  | { status: 'error'; error: string };

function maxTotal(rows: CumulativeTotals[]): number {
  return rows.reduce((m, r) => Math.max(m, r.officialTotal, r.userTotal), 0);
}

function normalizeForContestants(
  contestants: Array<{ id: string }>,
  totals: CumulativeTotals[]
): CumulativeTotals[] {
  const byId = new Map(totals.map((t) => [t.contestantId, t]));
  return contestants.map((c) => {
    const row = byId.get(c.id);
    return row ?? { contestantId: c.id, officialTotal: 0, userTotal: 0 };
  });
}

export function useCumulativeScores(
  seriesId: number,
  episodeNumber: number,
  taskNumber: number,
  userId?: string,
  /** Bumps when user scores are persisted so charts refetch without changing selection. */
  scoresSavedVersion = 0
): UseCumulativeScoresState {
  const [state, setState] = useState<UseCumulativeScoresState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: 'loading' });

      const [contestantsResult, totalsResult] = await Promise.all([
        fetchContestantsAction(seriesId),
        fetchCumulativeScoresAction(seriesId, episodeNumber, taskNumber, userId),
      ]);

      if (cancelled) return;

      if (!contestantsResult.success) {
        setState({ status: 'error', error: contestantsResult.error });
        return;
      }
      if (!totalsResult.success) {
        setState({ status: 'error', error: totalsResult.error });
        return;
      }

      const contestants = contestantsResult.data.map((c) => ({ id: c.id, name: c.name }));
      const episodeTotals = normalizeForContestants(contestants, totalsResult.data.episodeTotals);
      const seriesTotals = normalizeForContestants(contestants, totalsResult.data.seriesTotals);

      setState({
        status: 'loaded',
        contestants,
        episodeTotals,
        seriesTotals,
        episodeMax: maxTotal(episodeTotals),
        seriesMax: maxTotal(seriesTotals),
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [seriesId, episodeNumber, taskNumber, userId, scoresSavedVersion]);

  return state;
}

