import {
  deltaDirection,
  formatDate,
  formatDelta,
  formatValue,
} from "@/lib/format";
import type { SnapshotRow } from "@/lib/te";

function DeltaArrow({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const direction = deltaDirection(current, previous);

  if (direction === "flat") {
    return <span className="text-neutral-400">—</span>;
  }

  return (
    <span className="text-neutral-700" aria-hidden="true">
      {direction === "up" ? "▲" : "▼"}
    </span>
  );
}

type IndicatorCardsProps = {
  snapshots: SnapshotRow[];
};

export function IndicatorCards({ snapshots }: IndicatorCardsProps) {
  if (snapshots.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No data available for this country.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {snapshots.map((row) => (
        <article
          key={row.symbol}
          className="border border-neutral-200 bg-white p-4"
        >
          <h3 className="text-sm font-medium text-neutral-900">{row.description}</h3>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            {formatValue(row.last, row.unit)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{row.unit}</p>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-600">
            <span>
              Prev {formatValue(row.previous, row.unit)}
            </span>
            <span className="flex items-center gap-1">
              <DeltaArrow current={row.last} previous={row.previous} />
              {formatDelta(row.last, row.previous)}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-400">{formatDate(row.date)}</p>
        </article>
      ))}
    </div>
  );
}
