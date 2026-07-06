const CREDIT_RATING_TIERS: { min: number; label: string }[] = [
  { min: 100, label: "Prime" },
  { min: 95, label: "High grade" },
  { min: 85, label: "AA range" },
  { min: 80, label: "Upper medium grade" },
  { min: 70, label: "A range" },
  { min: 65, label: "Lower medium grade" },
  { min: 55, label: "BBB range" },
  { min: 50, label: "Non-investment grade" },
  { min: 35, label: "Highly speculative" },
  { min: 20, label: "Substantial risk" },
  { min: 0, label: "Distressed" },
];

export function formatValue(value: number, unit: string): string {
  if (unit === "TE index") {
    return String(Math.round(value));
  }

  if (unit.includes("US$")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return `${value.toFixed(2)}${unit.startsWith("%") ? "%" : ""}`;
}

export function formatCreditRatingDisplay(score: number): {
  score: string;
  label: string;
} {
  const rounded = Math.round(score);
  const label =
    CREDIT_RATING_TIERS.find((entry) => rounded >= entry.min)?.label ??
    "Unrated";
  return { score: String(rounded), label };
}

export function formatDelta(current: number, previous: number): string {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function formatOptionalValue(
  value: number | null | undefined,
  unit: string,
): string {
  if (value == null) return "—";
  return formatValue(value, unit);
}

export function deltaDirection(
  current: number,
  previous: number,
): "up" | "down" | "flat" {
  const delta = current - previous;
  if (Math.abs(delta) < 0.005) return "flat";
  return delta > 0 ? "up" : "down";
}

export function deltaSemanticClass(
  current: number,
  previous: number,
): string {
  const direction = deltaDirection(current, previous);
  if (direction === "up") return "text-delta-up";
  if (direction === "down") return "text-delta-down";
  return "text-subtle";
}

export function deltaBadgeClass(
  current: number,
  previous: number,
): string {
  const direction = deltaDirection(current, previous);
  if (direction === "up") {
    return "border-delta-up/30 bg-delta-up/10 text-delta-up hover:bg-delta-up/10";
  }
  if (direction === "down") {
    return "border-delta-down/30 bg-delta-down/10 text-delta-down hover:bg-delta-down/10";
  }
  return "text-muted-foreground";
}

export function deltaBarClass(
  current: number,
  previous: number,
): string {
  const direction = deltaDirection(current, previous);
  if (direction === "up") return "bg-emerald-600";
  if (direction === "down") return "bg-rose-600";
  return "bg-stone-300";
}

export function deltaBarWidth(
  current: number,
  previous: number,
  maxMagnitude = 2,
): number {
  const magnitude = Math.abs(current - previous);
  return Math.min(100, (magnitude / maxMagnitude) * 100);
}

/** One point of |Actual − Previous| maps to full sparkline height. */
export function deltaChartScale(_unit: string): number {
  return 1;
}
