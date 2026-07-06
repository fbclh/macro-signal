import { G7AtAGlanceTable } from "@/components/g7-at-a-glance-table";
import {
  COUNTRIES,
  G7_GLANCE_INDICATORS,
  INDICATORS,
  symbolFor,
} from "@/lib/catalog";
import { getSnapshot } from "@/lib/te";

type G7AtAGlanceProps = {
  selectedCountry: string;
};

export async function G7AtAGlance({ selectedCountry }: G7AtAGlanceProps) {
  const indicators = G7_GLANCE_INDICATORS.map((glance) => {
    const indicator = INDICATORS.find((item) => item.code === glance.code);
    if (!indicator) {
      throw new Error(`Missing catalog indicator: ${glance.code}`);
    }
    return {
      code: glance.code,
      columnLabel: glance.columnLabel,
      unit: indicator.unit,
    };
  });

  const symbols = COUNTRIES.flatMap((country) =>
    indicators.map((indicator) => symbolFor(country.iso3, indicator.code)),
  );

  let snapshots;
  try {
    snapshots = await getSnapshot(symbols);
  } catch {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load G7 readings. Try again later.
      </p>
    );
  }

  const snapshotBySymbol = new Map(
    snapshots.map((snapshot) => [snapshot.symbol, snapshot]),
  );

  const rows = COUNTRIES.map((country) => ({
    iso3: country.iso3,
    name: country.name,
    cells: Object.fromEntries(
      indicators.map((indicator) => {
        const symbol = symbolFor(country.iso3, indicator.code);
        return [indicator.code, snapshotBySymbol.get(symbol)];
      }),
    ),
  }));

  return (
    <G7AtAGlanceTable
      rows={rows}
      indicators={indicators}
      selectedCountry={selectedCountry}
    />
  );
}
