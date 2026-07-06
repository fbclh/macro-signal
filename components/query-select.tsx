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
    <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-neutral-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[10rem] border border-neutral-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-900"
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
