import {
  cardAccentClass,
  deltaDirection,
  deltaToneClass,
  formatCreditRatingDisplay,
  formatDate,
  formatDelta,
  formatValue,
} from "@/lib/format";
import {
  INDICATOR_GROUPS,
  INDICATORS,
} from "@/lib/catalog";
import type { HistoricalPoint, SnapshotRow } from "@/lib/te";

import { Sparkline } from "./sparkline";

function DeltaDisplay({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const direction = deltaDirection(current, previous);

  return (
    <span className={`inline-flex items-center gap-1 ${deltaToneClass(current, previous)}`}>
      {direction === "flat" ? "—" : direction === "up" ? "▲" : "▼"}
      {formatDelta(current, previous)}
    </span>
  );
}

export type IndicatorCardData = {
  snapshot: SnapshotRow;
  sparkline: number[];
  code: string;
};

type IndicatorCardsProps = {
  cards: IndicatorCardData[];
};

export function IndicatorCards({ cards }: IndicatorCardsProps) {
  if (cards.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No data available for this country.</p>
    );
  }

  const cardsByGroup = INDICATOR_GROUPS.map((group) => ({
    ...group,
    items: cards.filter((card) => {
      const indicator = INDICATORS.find((item) => item.code === card.code);
      return indicator?.group === group.id;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      {cardsByGroup.map((group) => (
        <div key={group.id}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {group.label}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(({ snapshot, sparkline, code }) => {
              const indicator = INDICATORS.find((item) => item.code === code);
              const isCredit = indicator?.unit === "TE index";
              const credit = isCredit
                ? formatCreditRatingDisplay(snapshot.last)
                : null;

              return (
                <article
                  key={snapshot.symbol}
                  className={`border border-neutral-200/80 border-l-[3px] bg-white p-4 shadow-sm ${cardAccentClass(snapshot.last, snapshot.previous)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-medium text-neutral-800">
                      {snapshot.description}
                    </h4>
                    <Sparkline values={sparkline} />
                  </div>

                  {isCredit && credit ? (
                    <div className="mt-3">
                      <p className="text-3xl font-semibold tabular-nums tracking-tight text-neutral-950">
                        {credit.score}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        TE index · {credit.label}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-3xl font-semibold tabular-nums tracking-tight text-neutral-950">
                        {formatValue(snapshot.last, snapshot.unit)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {snapshot.unit}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                    <span className="text-neutral-500">
                      Prev{" "}
                      <span className="tabular-nums text-neutral-700">
                        {formatValue(snapshot.previous, snapshot.unit)}
                      </span>
                    </span>
                    <DeltaDisplay
                      current={snapshot.last}
                      previous={snapshot.previous}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
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

export function sparklineValues(points: HistoricalPoint[]): number[] {
  return [...points]
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .slice(-12)
    .map((point) => point.value);
}
