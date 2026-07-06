import "server-only";

const BASE_URL = "https://api.tradingeconomics.com/worldbank";

export type HistoricalPoint = {
  symbol: string;
  date: string;
  value: number;
};

export type SnapshotRow = {
  symbol: string;
  last: number;
  date: string;
  previous: number;
  previousDate: string;
  country: string;
  category: string;
  description: string;
  frequency: string;
  unit: string;
  title: string;
  lastUpdate: string;
};

export class TeApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "TeApiError";
    this.status = status;
    this.url = url;
  }
}

function getApiKey(): string {
  const key = process.env.TE_API_KEY;
  if (!key) {
    throw new TeApiError("TE_API_KEY is not set", 500, BASE_URL);
  }
  return key;
}

function buildUrl(path: string, symbols: string[]): string {
  const params = new URLSearchParams({
    s: symbols.join(","),
    c: getApiKey(),
  });
  return `${BASE_URL}${path}?${params.toString()}`;
}

async function teFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    const body = await response.text();
    const snippet = body.replace(/\s+/g, " ").trim().slice(0, 200);
    throw new TeApiError(
      `Trading Economics API error (${response.status}): ${snippet}`,
      response.status,
      url.replace(/c=[^&]+/, "c=***"),
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    const snippet = body.replace(/\s+/g, " ").trim().slice(0, 200);
    throw new TeApiError(
      `Expected JSON but received: ${snippet}`,
      response.status,
      url.replace(/c=[^&]+/, "c=***"),
    );
  }

  return response.json() as Promise<T>;
}

export async function getHistorical(
  symbols: string[],
): Promise<HistoricalPoint[]> {
  if (symbols.length === 0) {
    return [];
  }

  const url = buildUrl("/historical", symbols);
  return teFetch<HistoricalPoint[]>(url);
}

export async function getSnapshot(symbols: string[]): Promise<SnapshotRow[]> {
  if (symbols.length === 0) {
    return [];
  }

  const url = buildUrl("/indicator", symbols);
  return teFetch<SnapshotRow[]>(url);
}
