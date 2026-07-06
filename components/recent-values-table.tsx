import {
  formatCreditRatingDisplay,
  formatValue,
} from "@/lib/format";
import { INDICATORS } from "@/lib/catalog";
import type { Indicator } from "@/lib/catalog";
import type { SnapshotRow } from "@/lib/te";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DeltaSparkline } from "./sparkline";

const flatCard = "rounded-sm border shadow-none ring-0";

export type RecentValuesRow = {
  indicator: Indicator;
  snapshot: SnapshotRow;
};

type RecentValuesTableProps = {
  rows: RecentValuesRow[];
};

function formatActual(snapshot: SnapshotRow, unit: string) {
  if (unit === "TE index") {
    const credit = formatCreditRatingDisplay(snapshot.last);
    return (
      <span>
        {credit.score}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {credit.label}
        </span>
      </span>
    );
  }
  return formatValue(snapshot.last, unit);
}

export function RecentValuesTable({ rows }: RecentValuesTableProps) {
  const rowsByCode = new Map(rows.map((row) => [row.indicator.code, row]));

  return (
    <Card className={`${flatCard} overflow-hidden py-0`}>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-4">Indicator</TableHead>
              <TableHead className="px-4 text-right">Actual</TableHead>
              <TableHead className="px-4 text-right">Previous</TableHead>
              <TableHead className="px-4 text-right">Consensus</TableHead>
              <TableHead className="px-4 text-right">Forecast</TableHead>
              <TableHead className="px-4" aria-label="Trend" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {INDICATORS.map((indicator) => {
              const row = rowsByCode.get(indicator.code);

              if (!row) {
                return (
                  <TableRow key={indicator.code}>
                    <TableCell className="px-4 text-muted-foreground">
                      {indicator.name}
                    </TableCell>
                    <TableCell
                      className="px-4 text-muted-foreground"
                      colSpan={5}
                    >
                      No data
                    </TableCell>
                  </TableRow>
                );
              }

              const { snapshot } = row;

              return (
                <TableRow key={indicator.code}>
                  <TableCell className="px-4 font-medium">
                    {indicator.name}
                  </TableCell>
                  <TableCell className="px-4 text-right tabular-nums">
                    {formatActual(snapshot, indicator.unit)}
                  </TableCell>
                  <TableCell className="px-4 text-right tabular-nums text-muted-foreground">
                    {formatValue(snapshot.previous, indicator.unit)}
                  </TableCell>
                  <TableCell className="px-4 text-right tabular-nums text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="px-4 text-right tabular-nums text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="px-4">
                    <DeltaSparkline
                      actual={snapshot.last}
                      previous={snapshot.previous}
                      unit={indicator.unit}
                      variant="curve"
                      compact
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
