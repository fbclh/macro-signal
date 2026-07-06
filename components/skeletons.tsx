export function CardsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-3 h-3 w-28 animate-pulse rounded bg-neutral-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                className="h-44 animate-pulse rounded-sm border border-neutral-200 bg-neutral-100 shadow-sm"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 animate-pulse rounded-sm border border-neutral-200 bg-neutral-100 shadow-sm" />
      <div className="h-72 animate-pulse rounded-sm border border-neutral-200 bg-neutral-100 shadow-sm sm:h-96" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="h-80 animate-pulse rounded-sm border border-neutral-200 bg-neutral-100 shadow-sm" />
  );
}
