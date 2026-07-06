import {
  deltaDirection,
  deltaSemanticClass,
  formatCreditRatingDisplay,
  formatDate,
  formatDelta,
  formatValue,
} from "@/lib/format";
import { INDICATOR_CARD_ROWS, INDICATORS } from "@/lib/catalog";
import type { SnapshotRow } from "@/lib/te";
import { Card, CardContent } from "@/components/ui/card";

import { DeltaSparkline } from "./sparkline";

const flatCard =
  "flex h-full flex-col gap-0 rounded-sm border shadow-none ring-0 py-4";

function DeltaArrow({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const direction = deltaDirection(current, previous);

  if (direction === "flat") {
    return <span className="text-subtle">—</span>;
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

function IndicatorCard({
  snapshot,
  code,
}: {
  snapshot: SnapshotRow;
  code: string;
}) {
  const indicator = INDICATORS.find((item) => item.code === code);
  const isCredit = indicator?.unit === "TE index";
  const credit = isCredit ? formatCreditRatingDisplay(snapshot.last) : null;

  return (
    <Card className={flatCard}>
      <CardContent className="flex flex-1 flex-col px-4 pt-0">
        <h4 className="text-sm font-medium">{snapshot.description}</h4>
        {isCredit && credit ? (
          <>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
              {credit.score}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              TE index · {credit.label}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
              {formatValue(snapshot.last, snapshot.unit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{snapshot.unit}</p>
          </>
        )}
        <div className="mt-3">
          <DeltaSparkline
            actual={snapshot.last}
            previous={snapshot.previous}
            unit={snapshot.unit}
            variant="curve"
          />
        </div>
        <div className="mt-auto border-t border-border-subtle pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Prev{" "}
              <span className="tabular-nums text-foreground">
                {formatValue(snapshot.previous, snapshot.unit)}
              </span>
            </span>
            <span
              className={`flex items-center gap-1 tabular-nums ${deltaSemanticClass(snapshot.last, snapshot.previous)}`}
            >
              <DeltaArrow current={snapshot.last} previous={snapshot.previous} />
              {formatDelta(snapshot.last, snapshot.previous)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(snapshot.date)}
          </p>
        </div>
      </CardContent>
    </Card>
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
      <p className="text-sm text-muted-foreground">No data available for this country.</p>
    );
  }

  const rows = INDICATOR_CARD_ROWS.map((row) => ({
    ...row,
    items: cards.filter((card) => {
      const indicator = INDICATORS.find((item) => item.code === card.code);
      return indicator != null && row.groupIds.includes(indicator.group);
    }),
  })).filter((row) => row.items.length > 0);

  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <div key={row.label}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {row.label}
          </h3>
          <div className="grid grid-cols-2 items-stretch gap-3 lg:grid-cols-4 lg:gap-4">
            {row.items.map((item) => (
              <IndicatorCard key={item.snapshot.symbol} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
