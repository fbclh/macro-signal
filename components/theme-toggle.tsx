"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = mounted && theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-sm shadow-none"
      onClick={toggle}
      disabled={!mounted}
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Theme"
      }
    >
      {isDark ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
