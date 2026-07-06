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

  return <RecentValuesTable snapshots={snapshots} />;
}
