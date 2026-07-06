export type IndicatorGroupId =
  | "growth-prices"
  | "labour-rates"
  | "external-fiscal"
  | "sovereign";

export type Country = {
  iso3: string;
  name: string;
};

export type Indicator = {
  code: string;
  name: string;
  unit: string;
  group: IndicatorGroupId;
  worldBank?: boolean;
};

export const INDICATOR_GROUPS: { id: IndicatorGroupId; label: string }[] = [
  { id: "growth-prices", label: "Growth & prices" },
  { id: "labour-rates", label: "Labour & rates" },
  { id: "external-fiscal", label: "External & fiscal" },
  { id: "sovereign", label: "Sovereign" },
];

export const COUNTRIES: Country[] = [
  { iso3: "can", name: "Canada" },
  { iso3: "fra", name: "France" },
  { iso3: "deu", name: "Germany" },
  { iso3: "ita", name: "Italy" },
  { iso3: "jpn", name: "Japan" },
  { iso3: "gbr", name: "United Kingdom" },
  { iso3: "usa", name: "United States" },
];

export const INDICATORS: Indicator[] = [
  {
    code: "ny.gdp.mktp.kd.zg",
    name: "GDP Growth Rate",
    unit: "%",
    group: "growth-prices",
  },
  {
    code: "fp.cpi.totl.zg",
    name: "Inflation Rate",
    unit: "%",
    group: "growth-prices",
  },
  {
    code: "sl.uem.totl.zs",
    name: "Unemployment Rate",
    unit: "%",
    group: "labour-rates",
  },
  {
    code: "fr.inr.lndp",
    name: "Interest Rate",
    unit: "%",
    group: "labour-rates",
  },
  {
    code: "ne.rsb.gnfs.zs",
    name: "Balance of Trade",
    unit: "% of GDP",
    group: "external-fiscal",
  },
  {
    code: "bn.cab.xoka.gd.zs",
    name: "Current Account to GDP",
    unit: "% of GDP",
    group: "external-fiscal",
  },
  {
    code: "gc.dod.totl.gd.zs",
    name: "Government Debt to GDP",
    unit: "% of GDP",
    group: "external-fiscal",
  },
  {
    code: "credit.rating",
    name: "Credit Rating",
    unit: "TE index",
    group: "sovereign",
    worldBank: false,
  },
];

export function symbolFor(iso3: string, code: string): string {
  return `${iso3}.${code}`;
}

export function isWorldBankIndicator(code: string): boolean {
  const indicator = INDICATORS.find((item) => item.code === code);
  return indicator?.worldBank !== false;
}

export function indicatorSignedAxis(code: string): boolean {
  return code === "ne.rsb.gnfs.zs" || code === "bn.cab.xoka.gd.zs";
}
