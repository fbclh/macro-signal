"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { applyTheme, readTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const segmentClass =
  "flex size-7 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function select(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  const isDark = mounted && theme === "dark";

  function segmentStyle(active: boolean) {
    return active
      ? {
          backgroundColor: "var(--toggle-active-bg)",
          color: "var(--toggle-active-fg)",
        }
      : {
          backgroundColor: "transparent",
          color: "var(--toggle-inactive-fg)",
        };
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-1.5",
        !mounted && "pointer-events-none opacity-0",
      )}
    >
      <button
        type="button"
        aria-pressed={!isDark}
        aria-label="Light mode"
        onClick={() => select("light")}
        style={segmentStyle(!isDark)}
        className={segmentClass}
      >
        <Sun className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-pressed={isDark}
        aria-label="Dark mode"
        onClick={() => select("dark")}
        style={segmentStyle(isDark)}
        className={segmentClass}
      >
        <Moon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
