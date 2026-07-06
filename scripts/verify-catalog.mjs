/**
 * Snapshot verification for all catalog country × indicator combinations.
 * Usage: node scripts/verify-catalog.mjs
 * Reads TE_API_KEY from .env.local (no extra dependencies).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const COUNTRIES = [
  { iso3: "can", name: "Canada" },
  { iso3: "fra", name: "France" },
  { iso3: "deu", name: "Germany" },
  { iso3: "ita", name: "Italy" },
  { iso3: "jpn", name: "Japan" },
  { iso3: "gbr", name: "United Kingdom" },
  { iso3: "usa", name: "United States" },
];

const INDICATORS = [
  { code: "ny.gdp.mktp.kd.zg", name: "GDP Growth Rate", worldBank: true },
  { code: "fr.inr.lndp", name: "Interest Rate", worldBank: true },
  { code: "fp.cpi.totl.zg", name: "Inflation Rate", worldBank: true },
  { code: "sl.uem.totl.zs", name: "Unemployment Rate", worldBank: true },
  { code: "gc.dod.totl.gd.zs", name: "Government Debt to GDP", worldBank: true },
  { code: "ne.rsb.gnfs.zs", name: "Balance of Trade", worldBank: true },
  { code: "bn.cab.xoka.gd.zs", name: "Current Account to GDP", worldBank: true },
  { code: "credit.rating", name: "Credit Rating", worldBank: false },
];

function loadApiKey() {
  const envPath = resolve(process.cwd(), ".env.local");
  const env = readFileSync(envPath, "utf8");
  const match = env.match(/^TE_API_KEY=(.+)$/m);
  if (!match) {
    throw new Error("TE_API_KEY not found in .env.local");
  }
  return match[1].trim();
}

async function checkSnapshot(symbol, apiKey) {
  const url = `https://api.tradingeconomics.com/worldbank/indicator?s=${symbol}&c=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      return { status: "error", detail: `HTTP ${response.status}` };
    }

    if (!text.trim().startsWith("[")) {
      return { status: "error", detail: "non-JSON response" };
    }

    const rows = JSON.parse(text);
    if (!Array.isArray(rows) || rows.length === 0) {
      return { status: "empty", detail: "[]" };
    }

    const row = rows[0];
    if (row.last == null) {
      return { status: "empty", detail: "no last value" };
    }

    return { status: "ok", detail: `last=${row.last}` };
  } catch (error) {
    return {
      status: "error",
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}

const apiKey = loadApiKey();
const results = [];

for (const country of COUNTRIES) {
  for (const indicator of INDICATORS) {
    const symbol = `${country.iso3}.${indicator.code}`;

    if (indicator.worldBank === false) {
      results.push({
        symbol,
        country: country.name,
        indicator: indicator.name,
        status: "skip",
        detail: "uses /credit-ratings, not worldbank",
      });
      continue;
    }

    const result = await checkSnapshot(symbol, apiKey);
    results.push({
      symbol,
      country: country.name,
      indicator: indicator.name,
      ...result,
    });
  }
}

const colSymbol = 28;
const colCountry = 18;
const colIndicator = 22;
const colStatus = 8;
const colDetail = 24;

console.log(
  "Symbol".padEnd(colSymbol) +
    "Country".padEnd(colCountry) +
    "Indicator".padEnd(colIndicator) +
    "Status".padEnd(colStatus) +
    "Detail",
);
console.log("-".repeat(colSymbol + colCountry + colIndicator + colStatus + colDetail));

for (const row of results) {
  console.log(
    row.symbol.padEnd(colSymbol) +
      row.country.padEnd(colCountry) +
      row.indicator.padEnd(colIndicator) +
      row.status.padEnd(colStatus) +
      row.detail,
  );
}

const ok = results.filter((r) => r.status === "ok").length;
const empty = results.filter((r) => r.status === "empty").length;
const errors = results.filter((r) => r.status === "error").length;
const skipped = results.filter((r) => r.status === "skip").length;

console.log("");
console.log(
  `Summary: ${ok} ok, ${empty} empty, ${errors} error, ${skipped} skipped (${results.length} total)`,
);
