import { getHistorical, TeApiError } from "@/lib/te";

export default async function Home() {
  let verification: {
    count?: number;
    first?: { date: string; value: number };
    last?: { date: string; value: number };
    error?: string;
  };

  try {
    const points = await getHistorical(["usa.fr.inr.rinr"]);
    verification = {
      count: points.length,
      first: points[0]
        ? { date: points[0].date, value: points[0].value }
        : undefined,
      last: points.at(-1)
        ? { date: points.at(-1)!.date, value: points.at(-1)!.value }
        : undefined,
    };
  } catch (error) {
    verification = {
      error:
        error instanceof TeApiError
          ? error.message
          : "Failed to fetch historical series",
    };
  }

  return (
    <main className="p-8 font-sans text-sm text-neutral-900">
      <h1 className="mb-4 text-lg font-medium">Phase 1 verification</h1>
      {verification.error ? (
        <p className="text-neutral-600">Error: {verification.error}</p>
      ) : (
        <dl className="space-y-1">
          <div>
            <dt className="inline font-medium">Points: </dt>
            <dd className="inline">{verification.count}</dd>
          </div>
          <div>
            <dt className="inline font-medium">First: </dt>
            <dd className="inline">
              {verification.first?.value} ({verification.first?.date})
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Last: </dt>
            <dd className="inline">
              {verification.last?.value} ({verification.last?.date})
            </dd>
          </div>
        </dl>
      )}
    </main>
  );
}
