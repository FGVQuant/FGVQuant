"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
const base =
  "inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground pressable";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Theme");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return <span aria-hidden className={cn(base, className)} />;

  const isDark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("toggle")}
      title={isDark ? t("light") : t("dark")}
      className={cn(
        base,
        "hover:border-border-strong hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
