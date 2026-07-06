"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
};

export function ComparisonChart({
  data,
  labelA,
  labelB,
  unit,
}: ComparisonChartProps) {
  if (data.length === 0 || data.every((row) => row.a == null && row.b == null)) {
    return (
      <div className="flex h-72 items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
        No data available for this combination
      </div>
    );
  }

  return (
    <div className="h-72 w-full border border-neutral-200 bg-white p-4 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "#737373", fontSize: 12 }}
            axisLine={{ stroke: "#d4d4d4" }}
            tickLine={{ stroke: "#d4d4d4" }}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 12 }}
            axisLine={{ stroke: "#d4d4d4" }}
            tickLine={{ stroke: "#d4d4d4" }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #d4d4d4",
              borderRadius: 0,
              boxShadow: "none",
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
            stroke="#000000"
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
