"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deltaDirection,
  deltaSemanticClass,
  formatDelta,
  formatValue,
} from "@/lib/format";
import type { SnapshotRow } from "@/lib/te";
import { cn } from "@/lib/utils";

const flatCard = "rounded-sm border shadow-none ring-0";

export type G7GlanceRow = {
  iso3: string;
  name: string;
  cells: Partial<Record<string, SnapshotRow>>;
};

export type G7GlanceIndicator = {
  code: string;
  columnLabel: string;
  unit: string;
};

type SortKey = "country" | string;
type SortDir = "asc" | "desc";

type G7AtAGlanceTableProps = {
  rows: G7GlanceRow[];
  indicators: G7GlanceIndicator[];
  selectedCountry: string;
};

function DeltaSuffix({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const direction = deltaDirection(current, previous);
  const arrow =
    direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        deltaSemanticClass(current, previous),
      )}
    >
      {arrow} {formatDelta(current, previous)}
    </span>
  );
}

function ValueCell({
  snapshot,
  indicator,
}: {
  snapshot?: SnapshotRow;
  indicator: G7GlanceIndicator;
}) {
  if (!snapshot) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
      <span className="tabular-nums font-medium">
        {formatValue(snapshot.last, indicator.unit, indicator.code)}
      </span>
      <DeltaSuffix current={snapshot.last} previous={snapshot.previous} />
    </span>
  );
}

function SortButton({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground",
        align === "right" && "ml-auto",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span>{label}</span>
      {active ? (
        <span className="text-[10px] text-muted-foreground" aria-hidden="true">
          {direction === "asc" ? "▲" : "▼"}
        </span>
      ) : null}
    </button>
  );
}

export function G7AtAGlanceTable({
  rows,
  indicators,
  selectedCountry,
}: G7AtAGlanceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function selectCountry(iso3: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("country", iso3);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "country" ? "asc" : "desc");
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;

    const next = [...rows];

    next.sort((a, b) => {
      if (sortKey === "country") {
        const cmp = a.name.localeCompare(b.name);
        return sortDir === "asc" ? cmp : -cmp;
      }

      const aValue = a.cells[sortKey]?.last;
      const bValue = b.cells[sortKey]?.last;

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const cmp = aValue - bValue;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return next;
  }, [rows, sortDir, sortKey]);

  return (
    <Card className={`${flatCard} overflow-hidden py-0`}>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-4">
                <SortButton
                  label="Country"
                  active={sortKey === "country"}
                  direction={sortDir}
                  onClick={() => toggleSort("country")}
                />
              </TableHead>
              {indicators.map((indicator) => (
                <TableHead key={indicator.code} className="px-4 text-right">
                  <SortButton
                    label={indicator.columnLabel}
                    active={sortKey === indicator.code}
                    direction={sortDir}
                    onClick={() => toggleSort(indicator.code)}
                    align="right"
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => {
              const selected = row.iso3 === selectedCountry;

              return (
                <TableRow
                  key={row.iso3}
                  tabIndex={0}
                  role="button"
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Select ${row.name}`}
                  onClick={() => selectCountry(row.iso3)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectCountry(row.iso3);
                    }
                  }}
                  className={cn(
                    "cursor-pointer border-l-2 border-l-transparent hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
                    selected &&
                      "border-l-foreground bg-muted/60 dark:bg-muted/35",
                  )}
                >
                  <TableCell className="px-4 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[8px] leading-none",
                          selected ? "text-foreground" : "text-transparent",
                        )}
                        aria-hidden="true"
                      >
                        ●
                      </span>
                      {row.name}
                    </span>
                  </TableCell>
                  {indicators.map((indicator) => (
                    <TableCell
                      key={indicator.code}
                      className="px-4 text-right"
                    >
                      <ValueCell
                        snapshot={row.cells[indicator.code]}
                        indicator={indicator}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
