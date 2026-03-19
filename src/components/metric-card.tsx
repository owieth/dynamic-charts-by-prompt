"use client";

interface MetricCardProps {
  label: string;
  value: string;
  description: string | null;
}

export function MetricCard({ props }: { props: MetricCardProps }) {
  return (
    <div className="flex-1 min-w-[140px] rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-4">
      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
        {props.label}
      </p>
      <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--card-foreground))]">
        {props.value}
      </p>
      {props.description && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          {props.description}
        </p>
      )}
    </div>
  );
}
