import { RecentValuesTable } from "@/components/recent-values-table";
import { INDICATORS, symbolFor } from "@/lib/catalog";
import { getSnapshot } from "@/lib/te";

type CountryTableProps = {
  country: string;
};

export async function CountryTable({ country }: CountryTableProps) {
  const symbols = INDICATORS.map((indicator) =>
    symbolFor(country, indicator.code),
  );
  const snapshots = await getSnapshot(symbols);

  const rows = INDICATORS.map((indicator) => {
    const symbol = symbolFor(country, indicator.code);
    const snapshot = snapshots.find((row) => row.symbol === symbol);
    if (!snapshot) return null;
    return { indicator, snapshot };
  }).filter((row): row is NonNullable<typeof row> => row != null);

  return <RecentValuesTable rows={rows} />;
}
