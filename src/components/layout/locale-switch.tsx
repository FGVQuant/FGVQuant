"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations("Locale");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("switch")}
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-border p-0.5 font-mono text-xs",
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            title={t(locale)}
            aria-pressed={active}
            onClick={() => {
              if (!active) router.replace(pathname, { locale });
            }}
            className={cn(
              "h-full pressable rounded-full px-2.5 uppercase",
              active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
