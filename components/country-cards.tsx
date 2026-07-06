import {
  IndicatorCards,
  sparklineValues,
  type IndicatorCardData,
} from "@/components/indicator-cards";
import { COUNTRIES, INDICATORS, symbolFor } from "@/lib/catalog";
import { getHistorical, getSnapshot } from "@/lib/te";

type CountryCardsProps = {
  country: string;
};

export async function CountryCards({ country }: CountryCardsProps) {
  const symbols = INDICATORS.map((indicator) =>
    symbolFor(country, indicator.code),
  );
  const [snapshots, historical] = await Promise.all([
    getSnapshot(symbols),
    getHistorical(symbols),
  ]);

  const historicalBySymbol = new Map<string, number[]>();
  for (const symbol of symbols) {
    const points = historical.filter((point) => point.symbol === symbol);
    historicalBySymbol.set(symbol, sparklineValues(points));
  }

  const cards: IndicatorCardData[] = INDICATORS.map((indicator) => {
    const symbol = symbolFor(country, indicator.code);
    const snapshot = snapshots.find((row) => row.symbol === symbol);
    if (!snapshot) return null;

    return {
      snapshot,
      sparkline: historicalBySymbol.get(symbol) ?? [],
      code: indicator.code,
    };
  }).filter((card): card is IndicatorCardData => card != null);

  return <IndicatorCards cards={cards} />;
}

export function countryLabel(iso3: string): string {
  return COUNTRIES.find((country) => country.iso3 === iso3)?.name ?? iso3;
}
