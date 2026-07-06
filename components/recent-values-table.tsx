import {
  deltaBarClass,
  deltaBarWidth,
  deltaDirection,
  deltaSemanticClass,
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
    <div className="overflow-x-auto border border-stone-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="border-b border-stone-200 px-4 py-3 font-medium">
              Indicator
            </th>
            <th className="border-b border-stone-200 px-4 py-3 text-right font-medium">
              Latest
            </th>
            <th className="border-b border-stone-200 px-4 py-3 text-right font-medium">
              Previous
            </th>
            <th className="border-b border-stone-200 px-4 py-3 font-medium">
              Δ
            </th>
            <th className="border-b border-stone-200 px-4 py-3 text-right font-medium">
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
                  className={index % 2 === 0 ? "bg-white" : "bg-stone-50/80"}
                >
                  <td className="border-b border-stone-100 px-4 py-3 text-stone-400">
                    {indicator.name}
                  </td>
                  <td
                    className="border-b border-stone-100 px-4 py-3 text-stone-400"
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

            return (
              <tr
                key={indicator.code}
                className={`text-stone-800 ${index % 2 === 0 ? "bg-white" : "bg-stone-50/80"}`}
              >
                <td className="border-b border-stone-100 px-4 py-3 font-medium text-stone-950">
                  {indicator.name}
                </td>
                <td className="border-b border-stone-100 px-4 py-3 text-right tabular-nums">
                  {isCredit && credit ? (
                    <span>
                      {credit.score}
                      <span className="ml-2 text-xs font-normal text-stone-500">
                        {credit.label}
                      </span>
                    </span>
                  ) : (
                    formatValue(row.last, row.unit)
                  )}
                </td>
                <td className="border-b border-stone-100 px-4 py-3 text-right tabular-nums text-stone-600">
                  {formatValue(row.previous, row.unit)}
                </td>
                <td className="border-b border-stone-100 px-4 py-3">
                  <div className="flex min-w-[7rem] items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={`h-full rounded-full ${deltaBarClass(row.last, row.previous)}`}
                        style={{ width: `${deltaBarWidth(row.last, row.previous)}%` }}
                      />
                    </div>
                    <span
                      className={`inline-flex min-w-[3rem] items-center justify-end gap-0.5 tabular-nums ${deltaSemanticClass(row.last, row.previous)}`}
                    >
                      {direction === "flat" ? "—" : direction === "up" ? "▲" : "▼"}
                      {formatDelta(row.last, row.previous)}
                    </span>
                  </div>
                </td>
                <td className="border-b border-stone-100 px-4 py-3 text-right tabular-nums text-stone-500">
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
