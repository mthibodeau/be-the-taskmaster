import { SCORE_CHART_CARD_SKELETON_HEIGHT_PX } from '@/components/score-chart-constants';

/**
 * Placeholder while cumulative score charts (Recharts) load via `next/dynamic`.
 */
export function ScoreChartsLoadingSkeleton() {
  const height = SCORE_CHART_CARD_SKELETON_HEIGHT_PX;

  return (
    <div
      className="mt-10 space-y-4"
      aria-busy="true"
      aria-label="Loading score charts"
    >
      {[0, 1].map((key) => (
        <div
          key={key}
          className="animate-pulse rounded-xl border border-border bg-muted/40"
          style={{ height }}
        />
      ))}
    </div>
  );
}
