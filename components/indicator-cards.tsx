import {
  deltaDirection,
  deltaSemanticClass,
  formatCreditRatingDisplay,
  formatDate,
  formatDelta,
  formatValue,
} from "@/lib/format";
import { INDICATOR_GROUPS, INDICATORS } from "@/lib/catalog";
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
    return <span className="text-stone-400">—</span>;
  }

  return (
    <span
      className={deltaSemanticClass(current, previous)}
      aria-hidden="true"
    >
      {direction === "up" ? "▲" : "▼"}
    </span>
  );
}

export type IndicatorCardItem = {
  snapshot: SnapshotRow;
  code: string;
};

type IndicatorCardsProps = {
  cards: IndicatorCardItem[];
};

export function IndicatorCards({ cards }: IndicatorCardsProps) {
  if (cards.length === 0) {
    return (
      <p className="text-sm text-stone-500">No data available for this country.</p>
    );
  }

  const groups = INDICATOR_GROUPS.map((group) => ({
    ...group,
    items: cards.filter((card) => {
      const indicator = INDICATORS.find((item) => item.code === card.code);
      return indicator?.group === group.id;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="mb-3 border-b border-stone-200 pb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            {group.label}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(({ snapshot, code }) => {
              const indicator = INDICATORS.find((item) => item.code === code);
              const isCredit = indicator?.unit === "TE index";
              const credit = isCredit
                ? formatCreditRatingDisplay(snapshot.last)
                : null;

              return (
              <article
                key={snapshot.symbol}
                className="border border-stone-200 bg-white p-4"
              >
                <h4 className="text-sm font-medium text-stone-900">
                  {snapshot.description}
                </h4>
                {isCredit && credit ? (
                  <>
                    <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-stone-950">
                      {credit.score}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      TE index · {credit.label}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-stone-950">
                      {formatValue(snapshot.last, snapshot.unit)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">{snapshot.unit}</p>
                  </>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-600">
                  <span>
                    Prev{" "}
                    <span className="tabular-nums">
                      {formatValue(snapshot.previous, snapshot.unit)}
                    </span>
                  </span>
                  <span
                    className={`flex items-center gap-1 tabular-nums ${deltaSemanticClass(snapshot.last, snapshot.previous)}`}
                  >
                    <DeltaArrow
                      current={snapshot.last}
                      previous={snapshot.previous}
                    />
                    {formatDelta(snapshot.last, snapshot.previous)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  {formatDate(snapshot.date)}
                </p>
              </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
