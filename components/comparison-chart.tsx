"use client";

import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ComparisonChartProps = {
  data: { year: number; a: number | null; b: number | null }[];
  labelA: string;
  labelB: string;
  unit: string;
  showZeroLine?: boolean;
  crossoverYear?: number | null;
};

export function ComparisonChart({
  data,
  labelA,
  labelB,
  unit,
  showZeroLine = false,
  crossoverYear = null,
}: ComparisonChartProps) {
  if (data.length === 0 || data.every((row) => row.a == null && row.b == null)) {
    return (
      <div className="flex h-72 items-center justify-center rounded-sm border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500 sm:h-96">
        No data available for this combination
      </div>
    );
  }

  const crossoverPoint =
    crossoverYear != null
      ? data.find((row) => row.year === crossoverYear)
      : undefined;

  const crossoverY =
    crossoverPoint?.a != null && crossoverPoint?.b != null
      ? (crossoverPoint.a + crossoverPoint.b) / 2
      : crossoverPoint?.a ?? crossoverPoint?.b ?? null;

  return (
    <div className="h-72 w-full rounded-sm border border-neutral-200/80 bg-white p-4 shadow-sm sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#ececec" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={{ stroke: "#d4d4d4" }}
            tickLine={{ stroke: "#d4d4d4" }}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={{ stroke: "#d4d4d4" }}
            tickLine={{ stroke: "#d4d4d4" }}
            width={48}
          />
          {showZeroLine ? (
            <ReferenceLine
              y={0}
              stroke="#a3a3a3"
              strokeDasharray="4 4"
              label={{
                value: "0",
                position: "insideTopLeft",
                fill: "#737373",
                fontSize: 10,
              }}
            />
          ) : null}
          <Tooltip
            contentStyle={{
              border: "1px solid #d4d4d4",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              fontSize: 12,
            }}
            formatter={(value) =>
              typeof value === "number" ? [`${value.toFixed(2)} ${unit}`, ""] : ["—", ""]
            }
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#525252" }} />
          <Line
            type="monotone"
            dataKey="a"
            name={labelA}
            stroke="#171717"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="b"
            name={labelB}
            stroke="#737373"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
          {crossoverYear != null && crossoverY != null ? (
            <ReferenceDot
              x={crossoverYear}
              y={crossoverY}
              r={4}
              fill="#171717"
              stroke="#ffffff"
              strokeWidth={2}
              label={{
                value: String(crossoverYear),
                position: "top",
                fill: "#525252",
                fontSize: 10,
              }}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
