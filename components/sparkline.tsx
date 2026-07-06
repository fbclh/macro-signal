type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({
  values,
  width = 88,
  height = 28,
  className = "",
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        className={className}
        aria-hidden="true"
      />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 2;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y =
      padding +
      (height - padding * 2) * (1 - (value - min) / range);
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const last = points.at(-1)!;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill="currentColor"
        className="text-neutral-100"
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-neutral-700"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={2}
        fill="currentColor"
        className="text-neutral-900"
      />
    </svg>
  );
}
