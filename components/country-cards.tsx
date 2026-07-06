import { IndicatorCards } from "@/components/indicator-cards";
import {
  COUNTRIES,
  INDICATORS,
  symbolFor,
} from "@/lib/catalog";
import { getSnapshot } from "@/lib/te";

type CountryCardsProps = {
  country: string;
};

export async function CountryCards({ country }: CountryCardsProps) {
  const symbols = INDICATORS.map((indicator) =>
    symbolFor(country, indicator.code),
  );
  const snapshots = await getSnapshot(symbols);

  const ordered = INDICATORS.map((indicator) => {
    const symbol = symbolFor(country, indicator.code);
    return snapshots.find((row) => row.symbol === symbol);
  }).filter((row): row is NonNullable<typeof row> => row != null);

  return <IndicatorCards snapshots={ordered} />;
}

export function countryLabel(iso3: string): string {
  return COUNTRIES.find((country) => country.iso3 === iso3)?.name ?? iso3;
}
