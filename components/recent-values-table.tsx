import {
  deltaBarWidth,
  deltaDirection,
  deltaToneClass,
  formatCreditRatingDisplay,
  formatDate,
  formatDelta,
  formatValue,
} from "@/lib/format";
import { INDICATORS } from "@/lib/catalog";
import type { SnapshotRow } from "@/lib/te";

type RecentValuesTableProps = {
  snapshots: SnapshotRow[];
};

export function RecentValuesTable({ snapshots }: RecentValuesTableProps) {
  const bySymbol = new Map(snapshots.map((row) => [row.symbol, row]));

  return (
    <div className="overflow-x-auto rounded-sm border border-neutral-200/80 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-neutral-100/80 text-left text-xs uppercase tracking-[0.14em] text-neutral-500">
          <tr>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Indicator
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 text-right font-medium">
              Latest
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 text-right font-medium">
              Previous
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Δ
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 text-right font-medium">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {INDICATORS.map((indicator, index) => {
            const row = [...bySymbol.values()].find((entry) =>
              entry.symbol.endsWith(`.${indicator.code}`),
            );

            if (!row) {
              return (
                <tr
                  key={indicator.code}
                  className={index % 2 === 0 ? "bg-white" : "bg-neutral-50/70"}
                >
                  <td className="border-b border-neutral-100 px-4 py-3 text-neutral-400">
                    {indicator.name}
                  </td>
                  <td
                    className="border-b border-neutral-100 px-4 py-3 text-neutral-400"
                    colSpan={4}
                  >
                    No data
                  </td>
                </tr>
              );
            }

            const direction = deltaDirection(row.last, row.previous);
            const isCredit = indicator.unit === "TE index";
            const credit = isCredit ? formatCreditRatingDisplay(row.last) : null;
            const barWidth = deltaBarWidth(row.last, row.previous);

            return (
              <tr
                key={indicator.code}
                className={`text-neutral-800 transition-colors hover:bg-neutral-50 ${index % 2 === 0 ? "bg-white" : "bg-neutral-50/70"}`}
              >
                <td className="border-b border-neutral-100 px-4 py-3 font-medium text-neutral-900">
                  {indicator.name}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3 text-right tabular-nums">
                  {isCredit && credit ? (
                    <span>
                      {credit.score}
                      <span className="ml-2 text-xs font-normal text-neutral-500">
                        {credit.label}
                      </span>
                    </span>
                  ) : (
                    formatValue(row.last, row.unit)
                  )}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3 text-right tabular-nums text-neutral-600">
                  {formatValue(row.previous, row.unit)}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3">
                  <div className="flex min-w-[7rem] items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className={`h-full rounded-full ${direction === "up" ? "bg-neutral-800" : "bg-neutral-400"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span
                      className={`inline-flex min-w-[3rem] items-center justify-end gap-0.5 tabular-nums ${deltaToneClass(row.last, row.previous)}`}
                    >
                      {direction === "flat" ? "—" : direction === "up" ? "▲" : "▼"}
                      {formatDelta(row.last, row.previous)}
                    </span>
                  </div>
                </td>
                <td className="border-b border-neutral-100 px-4 py-3 text-right tabular-nums text-neutral-500">
                  {formatDate(row.date)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
