import { Suspense } from "react";

import { ComparisonPanel, countryOptions, indicatorOptions } from "@/components/comparison-panel";
import { CountryCards } from "@/components/country-cards";
import { G7AtAGlance } from "@/components/g7-at-a-glance";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { QuerySelect } from "@/components/query-select";
import { CardsSkeleton, ChartSkeleton, G7GlanceSkeleton } from "@/components/skeletons";
import { COUNTRIES } from "@/lib/catalog";
import { resolveSearchParams, type PageSearchParams } from "@/lib/search-params";

type HomeProps = {
  searchParams: Promise<PageSearchParams>;
};

const countrySelectOptions = COUNTRIES.map((country) => ({
  value: country.iso3,
  label: country.name,
}));

export default async function Home({ searchParams }: HomeProps) {
  const params = resolveSearchParams(await searchParams);

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 pt-10 pb-0 sm:px-6 lg:px-8">
      <Header />

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">Main indicators</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Snapshot values for the selected economy
            </p>
          </div>
          <QuerySelect
            name="country"
            label="Country"
            value={params.country}
            options={countrySelectOptions}
          />
        </div>
        <Suspense fallback={<CardsSkeleton />} key={`cards-${params.country}`}>
          <CountryCards country={params.country} />
        </Suspense>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <h2 className="text-lg font-medium">Comparison</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Overlay two economies on one indicator (~25 years)
          </p>
        </div>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <QuerySelect
            name="chartA"
            label="Country A"
            value={params.chartA}
            options={countryOptions}
          />
          <QuerySelect
            name="chartB"
            label="Country B"
            value={params.chartB}
            options={countryOptions}
          />
          <QuerySelect
            name="chartIndicator"
            label="Indicator"
            value={params.chartIndicator}
            options={indicatorOptions}
          />
        </div>
        <Suspense
          fallback={<ChartSkeleton />}
          key={`chart-${params.chartA}-${params.chartB}-${params.chartIndicator}`}
        >
          <ComparisonPanel
            chartA={params.chartA}
            chartB={params.chartB}
            chartIndicator={params.chartIndicator}
          />
        </Suspense>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <h2 className="text-lg font-medium">G7 at a glance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest readings across all economies
          </p>
        </div>
        <Suspense fallback={<G7GlanceSkeleton />}>
          <G7AtAGlance selectedCountry={params.country} />
        </Suspense>
      </section>

      <Footer />
    </div>
  );
}
