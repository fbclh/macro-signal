# Macro Signal

**Live demo: https://macro-signal.vercel.app** ← (real link once deployed)

A G7 macroeconomic dashboard — snapshot cards, a 25-year two-country comparison chart with rule-based insights, and a multi-country scanner table. Built with Next.js (App Router), TypeScript, Tailwind, and Recharts.

![Macro Signal screenshot](./docs/screenshot.png)

Built for the Trading Economics developer task: implemented against the Trading Economics API interface, with live data served through a provider-adapter layer (see *Architecture*).

## Features

- **Main indicators** — snapshot cards with latest value, previous reading, delta, and 25-year sparkline per indicator
- **Comparison** — overlay any two G7 economies on one indicator (~25 years), with a generated one-line insight (consecutive-trend and crossover detection, pure logic — no AI calls)
- **G7 at a glance** — all countries × all indicators scanner; click a row to drive the cards
- Dark/light theme, responsive, zero client-side API keys

## Architecture & data sources

Trading Economics confirmed by email (July 2026) that guest keys and free developer
accounts have been discontinued. The app is therefore built against the TE API
interface (`lib/te.ts` — `/worldbank/historical`, `/worldbank/indicator` shapes) but
sources equivalent series live from open providers through a per-indicator adapter:

| Indicator | Source | Series |
|---|---|---|
| GDP Growth | World Bank | `NY.GDP.MKTP.KD.ZG` |
| Inflation (CPI) | World Bank | `FP.CPI.TOTL.ZG` |
| Unemployment | World Bank | `SL.UEM.TOTL.ZS` |
| Policy Interest Rate | FRED | `IRSTCB01{CC}M156N` ¹ |
| Balance of Trade | World Bank | `NE.RSB.GNFS.ZS` |
| Current Account | World Bank | `BN.CAB.XOKA.GD.ZS` |
| Government Debt | IMF WEO | `GGXWDG_NGDP` |
| 10Y Bond Yield | FRED | `IRLTLT01{CC}M156N` |

¹ Euro area members shown at the ECB policy rate; UK at SONIA (BoE series discontinued on FRED); US at the federal funds target range, upper limit.

Indicators were selected for **complete live coverage across all G7 economies** — series with partial coverage (real interest rate, central-government debt) were excluded. Run `npm run verify-catalog` to print the live 7×8 coverage matrix. Supplying a `TE_API_KEY` switches WB-sourced indicators to the Trading Economics API directly, with no UI changes.

All fetches are server-side with hourly revalidation; keys never reach the client. If a provider is unreachable, the app falls back to a bundled data snapshot rather than breaking.

## Getting started

```bash
npm install
cp .env.example .env.local   # add FRED_API_KEY (free: fred.stlouisfed.org)
npm run dev
```

| Variable | Required | Purpose |
|---|---|---|
| `FRED_API_KEY` | for live rate/yield data | Policy rates + 10Y yields |
| `TE_API_KEY` | optional | Routes WB indicators through the TE API instead |
| `USE_MOCK` | optional (`false`) | Fully offline fixtures |

## Scripts

```bash
npm run verify-catalog   # live coverage matrix across all providers
npm run generate-mock    # regenerate offline fixtures
```