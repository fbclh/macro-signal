"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = {
  value: string;
  label: string;
};

type QuerySelectProps = {
  name: string;
  label: string;
  value: string;
  options: Option[];
};

export function QuerySelect({ name, label, value, options }: QuerySelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, nextValue);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[10rem] rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-neutral-900 shadow-sm outline-none transition-colors hover:border-neutral-400 focus:border-neutral-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
