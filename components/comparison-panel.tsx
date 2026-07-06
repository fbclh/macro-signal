import { ComparisonChart } from "@/components/comparison-chart";
import { countryLabel } from "@/components/country-cards";
import { COUNTRIES, INDICATORS, indicatorSignedAxis, symbolFor } from "@/lib/catalog";
import { computeInsight, findCrossoverYear, mergeChartSeries } from "@/lib/insights";
import { getHistorical } from "@/lib/te";

type ComparisonPanelProps = {
  chartA: string;
  chartB: string;
  chartIndicator: string;
};

export async function ComparisonPanel({
  chartA,
  chartB,
  chartIndicator,
}: ComparisonPanelProps) {
  const indicator = INDICATORS.find((item) => item.code === chartIndicator);
  const symbolA = symbolFor(chartA, chartIndicator);
  const symbolB = symbolFor(chartB, chartIndicator);
  const historical = await getHistorical([symbolA, symbolB]);

  const pointsA = historical.filter((point) => point.symbol === symbolA);
  const pointsB = historical.filter((point) => point.symbol === symbolB);

  const labelA = countryLabel(chartA);
  const labelB = countryLabel(chartB);
  const unit = indicator?.unit ?? "";

  const seriesA = { country: labelA, points: pointsA };
  const seriesB = { country: labelB, points: pointsB };

  const chartData = mergeChartSeries(seriesA, seriesB);
  const insight = computeInsight(seriesA, seriesB, indicator?.name ?? "indicator");
  const crossoverYear = findCrossoverYear(seriesA, seriesB);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-neutral-200/80 bg-neutral-50 px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
          Insight
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{insight}</p>
      </div>
      <ComparisonChart
        data={chartData}
        labelA={labelA}
        labelB={labelB}
        unit={unit}
        showZeroLine={indicatorSignedAxis(chartIndicator)}
        crossoverYear={crossoverYear}
      />
    </div>
  );
}

export const countryOptions = COUNTRIES.map((country) => ({
  value: country.iso3,
  label: country.name,
}));

export const indicatorOptions = INDICATORS.map((indicator) => ({
  value: indicator.code,
  label: indicator.name,
}));
