import { Skeleton } from "@/components/ui/skeleton";

export function CardsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, rowIndex) => (
        <div key={rowIndex}>
          <Skeleton className="mb-3 h-3 w-48" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {Array.from({ length: 4 }).map((__, cardIndex) => (
              <Skeleton key={cardIndex} className="h-40 w-full rounded-sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-72 w-full rounded-sm sm:h-96" />;
}

export function TableSkeleton() {
  return <Skeleton className="h-64 w-full rounded-sm" />;
}
