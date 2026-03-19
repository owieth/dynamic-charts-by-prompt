'use client';

interface DashboardHeaderProps {
  title: string;
  subtitle: string | null;
}

export function DashboardHeader({ props }: { props: DashboardHeaderProps }) {
  return (
    <div className="px-2 py-3">
      <h1 className="text-xl font-semibold text-balance text-[rgb(var(--card-foreground))]">
        {props.title}
      </h1>
      {props.subtitle && (
        <p className="mt-1 text-sm text-pretty text-[rgb(var(--muted-foreground))]">
          {props.subtitle}
        </p>
      )}
    </div>
  );
}
