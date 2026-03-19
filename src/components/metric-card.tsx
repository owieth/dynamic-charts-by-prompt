'use client';

interface MetricCardProps {
  label: string;
  value: string;
  description: string | null;
  trend: 'up' | 'down' | 'neutral' | null;
  change: string | null;
}

function TrendIndicator({
  trend,
  change,
}: {
  trend: 'up' | 'down' | 'neutral';
  change: string | null;
}) {
  const colorClass =
    trend === 'up'
      ? 'text-green-500'
      : trend === 'down'
        ? 'text-rose-500'
        : 'text-[rgb(var(--muted-foreground))]';

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
      {trend === 'up' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
        </svg>
      )}
      {trend === 'down' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />
        </svg>
      )}
      {trend === 'neutral' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 5H10V7H2V5Z" fill="currentColor" />
        </svg>
      )}
      {change && <span>{change}</span>}
    </span>
  );
}

export function MetricCard({ props }: { props: MetricCardProps }) {
  return (
    <div className="flex-1 min-w-[140px] h-full px-5 py-4">
      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
        {props.label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--card-foreground))]">
          {props.value}
        </p>
        {props.trend && (
          <TrendIndicator trend={props.trend} change={props.change} />
        )}
      </div>
      {props.description && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          {props.description}
        </p>
      )}
    </div>
  );
}
