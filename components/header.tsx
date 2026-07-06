export function Header() {
  return (
    <header className="border-b border-neutral-200 pb-8">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        World Bank macro indicators
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
        Macro Signal
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
        Compare growth, inflation, unemployment, and rates across major economies.
      </p>
    </header>
  );
}
