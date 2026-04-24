'use client';

import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CumulativeTotals } from '@/hooks/useCumulativeScores';
import { SCORE_CHART_PLOT_HEIGHT_PX } from '@/components/score-chart-constants';

const BAR_CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 8 } as const;

const tooltipContentStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
} as const;

const tooltipLabelStyle = {
  color: 'var(--muted-foreground)',
} as const;

type ContestantLabel = { id: string; name: string };

type ChartRow = {
  name: string;
  official: number;
  mine: number;
};

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function buildChartRows(
  contestants: ContestantLabel[],
  totals: CumulativeTotals[]
): ChartRow[] {
  const byId = new Map(totals.map((t) => [t.contestantId, t]));
  return contestants.map((c) => {
    const row = byId.get(c.id) ?? { contestantId: c.id, officialTotal: 0, userTotal: 0 };
    return {
      name: shortName(c.name),
      official: row.officialTotal,
      mine: row.userTotal,
    };
  });
}

function ScoreBarChart({ data, chartMax }: { data: ChartRow[]; chartMax: number }) {
  const yMax = Math.max(chartMax, 1);

  return (
    <div className="min-w-0 w-full" style={{ height: SCORE_CHART_PLOT_HEIGHT_PX }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={BAR_CHART_MARGIN} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            domain={[0, yMax]}
            allowDecimals={false}
            width={36}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.12 }}
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
          />
          <Legend
            wrapperStyle={{
              paddingTop: 12,
              fontSize: 12,
              color: 'var(--muted-foreground)',
            }}
          />
          <Bar
            dataKey="official"
            name="Official"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey="mine"
            name="My total"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TotalsChartSection({
  title,
  subtitle,
  titleId,
  data,
  chartMax,
}: {
  title: string;
  subtitle: string;
  titleId: string;
  data: ChartRow[];
  chartMax: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 id={titleId} className="text-sm font-semibold text-card-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <figure className="w-full min-w-0 outline-none" aria-labelledby={titleId}>
        <ScoreBarChart data={data} chartMax={chartMax} />
      </figure>
    </section>
  );
}

export default function CumulativeScoreCharts({
  selection,
  contestants,
  episodeTotals,
  seriesTotals,
  episodeMax,
  seriesMax,
}: {
  selection: { seriesId: number; episodeNumber: number; taskNumber: number };
  contestants: ContestantLabel[];
  episodeTotals: CumulativeTotals[];
  seriesTotals: CumulativeTotals[];
  episodeMax: number;
  seriesMax: number;
}) {
  const { seriesId, episodeNumber, taskNumber } = selection;
  const id = useId();
  const episodeTitleId = `${id}-episode`;
  const seriesTitleId = `${id}-series`;

  const episodeData = buildChartRows(contestants, episodeTotals);
  const seriesData = buildChartRows(contestants, seriesTotals);

  const blocks = [
    {
      key: 'episode',
      title: 'Episode total',
      subtitle: `Through Task ${taskNumber} (this episode)`,
      titleId: episodeTitleId,
      data: episodeData,
      chartMax: episodeMax,
    },
    {
      key: 'series',
      title: 'Series total',
      subtitle: `Through S${seriesId} • E${episodeNumber} • Task ${taskNumber}`,
      titleId: seriesTitleId,
      data: seriesData,
      chartMax: seriesMax,
    },
  ] as const;

  return (
    <div className="mt-10 space-y-4">
      {blocks.map((b) => (
        <TotalsChartSection
          key={b.key}
          title={b.title}
          subtitle={b.subtitle}
          titleId={b.titleId}
          data={b.data}
          chartMax={b.chartMax}
        />
      ))}
    </div>
  );
}
