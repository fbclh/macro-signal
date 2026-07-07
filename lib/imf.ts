import "server-only";

import {
  COUNTRIES,
  IMF_DEBT_CODE,
  symbolFor,
  type Indicator,
} from "@/lib/catalog";
import type { HistoricalPoint, SnapshotRow } from "@/lib/data";
import { DataApiError } from "@/lib/data";
import { INDICATORS } from "@/lib/catalog";

const BASE_URL = "https://www.imf.org/external/datamapper/api/v1";
const G7_IMF = COUNTRIES.map((country) => country.iso3.toUpperCase()).join("/");

type ImfValues = Record<string, Record<string, number>>;

export class ImfApiError extends DataApiError {
  constructor(message: string, status: number, url: string) {
    super(message, status, url);
    this.name = "ImfApiError";
  }
}

function parseSymbol(symbol: string): { iso3: string; code: string } {
  const dot = symbol.indexOf(".");
  if (dot <= 0) {
    throw new ImfApiError(`Invalid symbol: ${symbol}`, 400, symbol);
  }
  return {
    iso3: symbol.slice(0, dot),
    code: symbol.slice(dot + 1),
  };
}

function yearEndIso(year: string): string {
  return `${year}-12-31T00:00:00`;
}

function indicatorMeta(code: string): Indicator {
  const indicator = INDICATORS.find((item) => item.code === code);
  if (!indicator) {
    throw new ImfApiError(`Unknown indicator code: ${code}`, 400, code);
  }
  return indicator;
}

function countryName(iso3: string): string {
  return COUNTRIES.find((country) => country.iso3 === iso3)?.name ?? iso3;
}

async function imfFetch(indicatorCode: string): Promise<ImfValues> {
  const imfCode = indicatorCode.toUpperCase();
  const url = `${BASE_URL}/${imfCode}/${G7_IMF}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    const body = await response.text();
    const snippet = body.replace(/\s+/g, " ").trim().slice(0, 200);
    throw new ImfApiError(
      `IMF DataMapper API error (${response.status}): ${snippet}`,
      response.status,
      url,
    );
  }

  const payload = (await response.json()) as {
    values?: Record<string, ImfValues>;
  };

  return payload.values?.[imfCode] ?? {};
}

function buildHistoricalForCountry(
  symbol: string,
  series: Record<string, number> | undefined,
): HistoricalPoint[] {
  if (!series) return [];

  return Object.entries(series)
    .filter(([, value]) => value != null && !Number.isNaN(value))
    .map(([year, value]) => ({
      symbol,
      date: yearEndIso(year),
      value,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildSnapshotFromHistory(
  symbol: string,
  points: HistoricalPoint[],
): SnapshotRow | null {
  if (points.length === 0) return null;

  const { iso3, code } = parseSymbol(symbol);
  const indicator = indicatorMeta(code);
  const sorted = [...points].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const previous = sorted[1] ?? sorted[0];
  const name = countryName(iso3);

  return {
    symbol,
    last: last.value,
    date: last.date,
    previous: previous.value,
    previousDate: previous.date,
    country: name,
    category: indicator.group,
    description: indicator.name,
    frequency: "Yearly",
    unit: indicator.unit,
    title: `${name} ${indicator.name}`,
    lastUpdate: last.date,
    consensus: null,
    forecast: null,
  };
}

function groupSymbols(symbols: string[]): Map<string, Set<string>> {
  const byIndicator = new Map<string, Set<string>>();

  for (const symbol of symbols) {
    const { iso3, code } = parseSymbol(symbol);
    if (code !== IMF_DEBT_CODE) continue;
    const countries = byIndicator.get(code) ?? new Set<string>();
    countries.add(iso3);
    byIndicator.set(code, countries);
  }

  return byIndicator;
}

export async function imfGetHistorical(
  symbols: string[],
): Promise<HistoricalPoint[]> {
  if (symbols.length === 0) return [];

  const byIndicator = groupSymbols(symbols);
  const pointsBySymbol = new Map<string, HistoricalPoint[]>();

  for (const [code] of byIndicator) {
    const values = await imfFetch(code);

    for (const country of COUNTRIES) {
      const symbol = symbolFor(country.iso3, code);
      if (!symbols.includes(symbol)) continue;
      const imfIso = country.iso3.toUpperCase();
      pointsBySymbol.set(
        symbol,
        buildHistoricalForCountry(symbol, values[imfIso]),
      );
    }
  }

  return symbols.flatMap((symbol) => pointsBySymbol.get(symbol) ?? []);
}

export async function imfGetSnapshot(symbols: string[]): Promise<SnapshotRow[]> {
  const historical = await imfGetHistorical(symbols);

  const bySymbol = new Map<string, HistoricalPoint[]>();
  for (const point of historical) {
    const bucket = bySymbol.get(point.symbol) ?? [];
    bucket.push(point);
    bySymbol.set(point.symbol, bucket);
  }

  return symbols
    .map((symbol) => buildSnapshotFromHistory(symbol, bySymbol.get(symbol) ?? []))
    .filter((row): row is SnapshotRow => row != null);
}
