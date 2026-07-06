/**
 * Snapshot verification for all catalog country × indicator combinations.
 * Usage: node scripts/verify-catalog.mjs
 * Reads TE_API_KEY from .env.local (no extra dependencies).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const COUNTRIES = [
  { iso3: "usa", name: "USA" },
  { iso3: "bra", name: "Brazil" },
  { iso3: "mex", name: "Mexico" },
  { iso3: "jpn", name: "Japan" },
  { iso3: "deu", name: "Germany" },
  { iso3: "gbr", name: "United Kingdom" },
  { iso3: "chn", name: "China" },
  { iso3: "ind", name: "India" },
];

const INDICATORS = [
  { code: "ny.gdp.mktp.kd.zg", name: "GDP Growth" },
  { code: "fp.cpi.totl.zg", name: "Inflation (CPI)" },
  { code: "sl.uem.totl.zs", name: "Unemployment" },
  { code: "fr.inr.rinr", name: "Real Interest Rate" },
  { code: "ny.gdp.pcap.cd", name: "GDP per Capita" },
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

console.log("");
console.log(`Summary: ${ok} ok, ${empty} empty, ${errors} error (${results.length} total)`);
