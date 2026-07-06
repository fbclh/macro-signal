export function CardsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, rowIndex) => (
        <div key={rowIndex}>
          <div className="mb-3 h-3 w-48 animate-pulse bg-stone-200" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                className="h-40 animate-pulse border border-stone-200 bg-stone-100"
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
    <div className="h-72 animate-pulse border border-stone-200 bg-stone-100 sm:h-96" />
  );
}

export function TableSkeleton() {
  return (
    <div className="h-64 animate-pulse border border-stone-200 bg-stone-100" />
  );
}
