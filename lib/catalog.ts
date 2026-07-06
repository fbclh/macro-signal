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
  { id: "sovereign", label: "Sovereign & credit" },
];

/** Two display rows of four cards, preserving group order left-to-right. */
export const INDICATOR_CARD_ROWS: {
  label: string;
  groupIds: IndicatorGroupId[];
}[] = [
  {
    label: "Growth & prices · Labour & rates",
    groupIds: ["growth-prices", "labour-rates"],
  },
  {
    label: "External & fiscal · Sovereign & credit",
    groupIds: ["external-fiscal", "sovereign"],
  },
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
    group: "sovereign",
  },
  {
    code: "credit.rating",
    name: "Credit Rating",
    unit: "",
    group: "sovereign",
    worldBank: false,
  },
];

export const CREDIT_RATING_CODE = "credit.rating";

export function isCreditRating(code: string): boolean {
  return code === CREDIT_RATING_CODE;
}

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
