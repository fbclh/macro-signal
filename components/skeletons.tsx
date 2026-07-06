export function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse border border-neutral-200 bg-neutral-100"
        />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-72 animate-pulse border border-neutral-200 bg-neutral-100 sm:h-96" />
  );
}

export function TableSkeleton() {
  return (
    <div className="h-64 animate-pulse border border-neutral-200 bg-neutral-100" />
  );
}
