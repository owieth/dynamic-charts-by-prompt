'use client';

export function ChartSkeleton() {
  return (
    <div className="size-full flex flex-col gap-3 p-4">
      <div className="h-4 w-2/5 rounded bg-surface-hi animate-pulse" />
      <div className="flex-1 flex items-end gap-2 px-2 pb-2">
        <div className="h-3/5 flex-1 rounded bg-surface-hi/50 animate-pulse" />
        <div className="h-4/5 flex-1 rounded bg-surface-hi/40 animate-pulse" />
        <div className="h-2/5 flex-1 rounded bg-surface-hi/50 animate-pulse" />
        <div className="h-3/4 flex-1 rounded bg-surface-hi/40 animate-pulse" />
        <div className="h-1/2 flex-1 rounded bg-surface-hi/50 animate-pulse" />
        <div className="h-4/5 flex-1 rounded bg-surface-hi/40 animate-pulse" />
        <div className="h-2/3 flex-1 rounded bg-surface-hi/50 animate-pulse" />
      </div>
      <div className="h-2 w-full rounded bg-surface-hi/30 animate-pulse" />
    </div>
  );
}
