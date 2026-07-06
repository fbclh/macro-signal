export type Country = {
  iso3: string;
  name: string;
};

export type Indicator = {
  code: string;
  name: string;
  unit: string;
};

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
  { code: "ny.gdp.mktp.kd.zg", name: "GDP Growth", unit: "% annual" },
  { code: "fp.cpi.totl.zg", name: "Inflation (CPI)", unit: "% annual" },
  { code: "sl.uem.totl.zs", name: "Unemployment", unit: "% of labor force" },
  { code: "fr.inr.rinr", name: "Real Interest Rate", unit: "%" },
  { code: "ny.gdp.pcap.cd", name: "GDP per Capita", unit: "current US$" },
];

export function symbolFor(iso3: string, code: string): string {
  return `${iso3}.${code}`;
}
