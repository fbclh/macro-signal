import {
  deltaDirection,
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
    <div className="overflow-x-auto border border-neutral-200">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Indicator
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Latest
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Previous
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Δ
            </th>
            <th className="border-b border-neutral-200 px-4 py-3 font-medium">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {INDICATORS.map((indicator) => {
            const row = [...bySymbol.values()].find((entry) =>
              entry.symbol.endsWith(`.${indicator.code}`),
            );

            if (!row) {
              return (
                <tr key={indicator.code} className="text-neutral-400">
                  <td className="border-b border-neutral-100 px-4 py-3">
                    {indicator.name}
                  </td>
                  <td className="border-b border-neutral-100 px-4 py-3" colSpan={4}>
                    No data
                  </td>
                </tr>
              );
            }

            const direction = deltaDirection(row.last, row.previous);

            return (
              <tr key={indicator.code} className="text-neutral-800">
                <td className="border-b border-neutral-100 px-4 py-3 font-medium text-neutral-950">
                  {indicator.name}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3">
                  {formatValue(row.last, row.unit)}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3">
                  {formatValue(row.previous, row.unit)}
                </td>
                <td className="border-b border-neutral-100 px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    {direction === "flat" ? "—" : direction === "up" ? "▲" : "▼"}
                    {formatDelta(row.last, row.previous)}
                  </span>
                </td>
                <td className="border-b border-neutral-100 px-4 py-3 text-neutral-500">
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
