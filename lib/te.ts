import "server-only";

import type { HistoricalPoint, SnapshotRow } from "@/lib/data";
import { DataApiError } from "@/lib/data";
import { indicatorSource, type DataSource } from "@/lib/catalog";
import { isMockEnabled } from "@/lib/env";
import { fredGetHistorical, fredGetSnapshot } from "@/lib/fred";
import { imfGetHistorical, imfGetSnapshot } from "@/lib/imf";
import { mockGetHistorical, mockGetSnapshot } from "@/lib/mock";
import { wbGetHistorical, wbGetSnapshot } from "@/lib/wb";

export type { HistoricalPoint, SnapshotRow } from "@/lib/data";
export { DataApiError as TeApiError } from "@/lib/data";

type ProviderFns = {
  getHistorical: (symbols: string[]) => Promise<HistoricalPoint[]>;
  getSnapshot: (symbols: string[]) => Promise<SnapshotRow[]>;
};

const PROVIDERS: Record<DataSource, ProviderFns> = {
  worldbank: {
    getHistorical: wbGetHistorical,
    getSnapshot: wbGetSnapshot,
  },
  imf: {
    getHistorical: imfGetHistorical,
    getSnapshot: imfGetSnapshot,
  },
  fred: {
    getHistorical: fredGetHistorical,
    getSnapshot: fredGetSnapshot,
  },
};

function parseSymbolCode(symbol: string): string {
  const dot = symbol.indexOf(".");
  return dot > 0 ? symbol.slice(dot + 1) : symbol;
}

function splitSymbolsBySource(symbols: string[]): Map<DataSource, string[]> {
  const buckets = new Map<DataSource, string[]>();

  for (const symbol of symbols) {
    const source = indicatorSource(parseSymbolCode(symbol));
    const bucket = buckets.get(source) ?? [];
    bucket.push(symbol);
    buckets.set(source, bucket);
  }

  return buckets;
}

async function fetchHistoricalFromProviders(
  buckets: Map<DataSource, string[]>,
): Promise<HistoricalPoint[]> {
  const entries = [...buckets.entries()];
  const results = await Promise.all(
    entries.map(async ([source, sourceSymbols]) => {
      try {
        return await PROVIDERS[source].getHistorical(sourceSymbols);
      } catch (error) {
        if (error instanceof DataApiError) throw error;
        throw new DataApiError(
          error instanceof Error ? error.message : "Failed to fetch historical data",
          502,
          source,
        );
      }
    }),
  );

  return results.flat();
}

async function fetchSnapshotFromProviders(
  buckets: Map<DataSource, string[]>,
): Promise<SnapshotRow[]> {
  const entries = [...buckets.entries()];
  const results = await Promise.all(
    entries.map(async ([source, sourceSymbols]) => {
      try {
        return await PROVIDERS[source].getSnapshot(sourceSymbols);
      } catch (error) {
        if (error instanceof DataApiError) throw error;
        throw new DataApiError(
          error instanceof Error ? error.message : "Failed to fetch snapshot data",
          502,
          source,
        );
      }
    }),
  );

  return results.flat();
}

export async function getHistorical(
  symbols: string[],
): Promise<HistoricalPoint[]> {
  if (symbols.length === 0) {
    return [];
  }

  if (isMockEnabled()) {
    return mockGetHistorical(symbols);
  }

  const buckets = splitSymbolsBySource(symbols);
  return fetchHistoricalFromProviders(buckets);
}

export async function getSnapshot(symbols: string[]): Promise<SnapshotRow[]> {
  if (symbols.length === 0) {
    return [];
  }

  if (isMockEnabled()) {
    return mockGetSnapshot(symbols);
  }

  const buckets = splitSymbolsBySource(symbols);
  return fetchSnapshotFromProviders(buckets);
}
