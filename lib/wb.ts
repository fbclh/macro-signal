import "server-only";

import {
  COUNTRIES,
  catalogCodeToWb,
  indicatorSource,
  INDICATORS,
  symbolFor,
  type Indicator,
} from "@/lib/catalog";
import type { HistoricalPoint, SnapshotRow } from "@/lib/data";
import { DataApiError } from "@/lib/data";

const BASE_URL = "https://api.worldbank.org/v2";
const G7_ISO3 = COUNTRIES.map((country) => country.iso3).join(";");
const DATE_RANGE = "2000:2024";
const PER_PAGE = 200;

type WbObservation = {
  countryiso3code?: string;
  date?: string;
  value: number | null;
};

export class WbApiError extends DataApiError {
  constructor(message: string, status: number, url: string) {
    super(message, status, url);
    this.name = "WbApiError";
  }
}

function parseSymbol(symbol: string): { iso3: string; code: string } {
  const dot = symbol.indexOf(".");
  if (dot <= 0) {
    throw new WbApiError(`Invalid symbol: ${symbol}`, 400, symbol);
  }
  return {
    iso3: symbol.slice(0, dot),
    code: symbol.slice(dot + 1),
  };
}

function wbDateToIso(year: string): string {
  return `${year}-12-31T00:00:00`;
}

function indicatorMeta(code: string): Indicator {
  const indicator = INDICATORS.find((item) => item.code === code);
  if (!indicator) {
    throw new WbApiError(`Unknown indicator code: ${code}`, 400, code);
  }
  return indicator;
}

function countryName(iso3: string): string {
  return COUNTRIES.find((country) => country.iso3 === iso3)?.name ?? iso3;
}

async function wbFetch(indicatorCode: string): Promise<WbObservation[]> {
  const wbCode = catalogCodeToWb(indicatorCode);
  const params = new URLSearchParams({
    format: "json",
    per_page: String(PER_PAGE),
    date: DATE_RANGE,
  });
  const url = `${BASE_URL}/country/${G7_ISO3}/indicator/${wbCode}?${params.toString()}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    const body = await response.text();
    const snippet = body.replace(/\s+/g, " ").trim().slice(0, 200);
    throw new WbApiError(
      `World Bank API error (${response.status}): ${snippet}`,
      response.status,
      url,
    );
  }

  const payload = (await response.json()) as [unknown, WbObservation[] | null];
  return Array.isArray(payload?.[1]) ? payload[1] : [];
}

function groupSymbols(symbols: string[]): Map<string, Set<string>> {
  const byIndicator = new Map<string, Set<string>>();

  for (const symbol of symbols) {
    const { iso3, code } = parseSymbol(symbol);
    if (indicatorSource(code) !== "worldbank") continue;
    const countries = byIndicator.get(code) ?? new Set<string>();
    countries.add(iso3);
    byIndicator.set(code, countries);
  }

  return byIndicator;
}

function buildHistoricalForSymbol(
  symbol: string,
  observations: WbObservation[],
): HistoricalPoint[] {
  const { iso3 } = parseSymbol(symbol);
  const iso = iso3.toUpperCase();

  return observations
    .filter(
      (row) =>
        row.countryiso3code?.toUpperCase() === iso && row.value != null && row.date,
    )
    .map((row) => ({
      symbol,
      date: wbDateToIso(row.date!),
      value: row.value as number,
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

export async function wbGetHistorical(
  symbols: string[],
): Promise<HistoricalPoint[]> {
  if (symbols.length === 0) return [];

  const byIndicator = groupSymbols(symbols);
  const pointsBySymbol = new Map<string, HistoricalPoint[]>();

  for (const [code, countries] of byIndicator) {
    const observations = await wbFetch(code);

    for (const iso3 of countries) {
      const symbol = symbolFor(iso3, code);
      pointsBySymbol.set(
        symbol,
        buildHistoricalForSymbol(symbol, observations),
      );
    }
  }

  return symbols.flatMap((symbol) => pointsBySymbol.get(symbol) ?? []);
}

export async function wbGetSnapshot(symbols: string[]): Promise<SnapshotRow[]> {
  const historical = await wbGetHistorical(symbols);

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
