/**
 * Generates lib/mock/fixtures.json — TE-shaped snapshot + historical data
 * for every catalog country × indicator combination.
 * Run: node scripts/generate-mock-fixtures.mjs
 */

import { writeFileSync } from "node:fs";
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
  {
    code: "ny.gdp.mktp.kd.zg",
    name: "GDP Growth Rate",
    unit: "%",
    category: "GDP",
    base: 2.4,
    spread: 2.5,
  },
  {
    code: "fp.cpi.totl.zg",
    name: "Inflation Rate",
    unit: "%",
    category: "Prices",
    base: 3.1,
    spread: 4,
  },
  {
    code: "sl.uem.totl.zs",
    name: "Unemployment Rate",
    unit: "%",
    category: "Labour",
    base: 5.5,
    spread: 6,
  },
  {
    code: "fr.inr.lndp",
    name: "Interest Rate",
    unit: "%",
    category: "Financial",
    base: 4.5,
    spread: 3,
  },
  {
    code: "gc.dod.totl.gd.zs",
    name: "Government Debt to GDP",
    unit: "% of GDP",
    category: "Government",
    base: 95,
    spread: 35,
  },
  {
    code: "ne.rsb.gnfs.zs",
    name: "Balance of Trade",
    unit: "% of GDP",
    category: "Trade",
    base: 0,
    spread: 4,
    signed: true,
  },
  {
    code: "bn.cab.xoka.gd.zs",
    name: "Current Account to GDP",
    unit: "% of GDP",
    category: "Trade",
    base: 0,
    spread: 3,
    signed: true,
  },
  {
    code: "credit.rating",
    name: "Credit Rating",
    unit: "TE index",
    category: "Ratings",
    base: 75,
    spread: 15,
    integer: true,
  },
];

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const snapshots = [];
const historical = {};

for (const country of COUNTRIES) {
  for (const indicator of INDICATORS) {
    const symbol = `${country.iso3}.${indicator.code}`;
    const seed = hash(symbol);
    const countryOffset = hash(country.iso3) % 100 / 50;
    const decimals = indicator.integer ? 0 : 2;
    const rawLast = indicator.base + countryOffset + (seed % 100) / 80;
    const signedFactor =
      indicator.signed && seed % 3 === 0 ? -1 : indicator.signed ? 0.6 : 1;
    const last = round(rawLast * signedFactor, decimals);
    const previous = round(
      last + ((seed % 7) - 3) * (indicator.integer ? 1 : 0.15),
      decimals,
    );

    snapshots.push({
      symbol,
      last,
      date: "2024-12-31T00:00:00",
      previous,
      previousDate: "2023-12-31T00:00:00",
      country: country.name,
      category: indicator.category,
      description: indicator.name,
      frequency: indicator.code === "credit.rating" ? "Monthly" : "Yearly",
      unit: indicator.unit,
      title: `${country.name} ${indicator.name}`,
      lastUpdate: "2025-01-15T00:00:00",
    });

    const points = [];
    for (let year = 2000; year <= 2024; year++) {
      const t = year - 2000;
      const wave = Math.sin((t + (seed % 12)) / 4) * indicator.spread * 0.35;
      const trend =
        (t - 12) * 0.04 * (indicator.code.includes("gc.dod") ? 0.8 : 0.02);
      const raw = indicator.base + countryOffset + wave + trend;
      const value = round(raw * signedFactor, decimals);
      points.push({
        symbol,
        date: `${year}-12-31T00:00:00`,
        value,
      });
    }
    historical[symbol] = points;
  }
}

const fixtures = { snapshots, historical };
const outPath = resolve(process.cwd(), "lib/mock/fixtures.json");
writeFileSync(outPath, JSON.stringify(fixtures, null, 2));
console.log(`Wrote ${snapshots.length} snapshots and ${Object.keys(historical).length} series to ${outPath}`);
