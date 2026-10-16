"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { getNav, isActive } from "./nav-items";
import { LocaleSwitch } from "./locale-switch";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

/** `recruitmentOpen` comes from content/site.json (read on the server in the locale layout). */
export function SiteHeader({ recruitmentOpen }: { recruitmentOpen: boolean }) {
  const t = useTranslations("Nav");
  const { items, cta } = getNav(recruitmentOpen);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="FGV Quant" className="rounded-md">
          <Logo />
        </Link>

        <nav aria-label={t("label")} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {items.map(({ key, href }) => {
              const active = isActive(pathname, href);
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-block rounded-full px-3 py-2 text-sm transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(key)}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-highlight"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <LocaleSwitch />
            <ThemeToggle />
          </div>
          <Link
            href={cta.href}
            className="hidden h-9 items-center rounded-full bg-primary px-4 text-sm font-medium whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {cta.key === "join" ? t("join") : t("partnerCta")}
          </Link>
          <MobileNav items={items} cta={cta} />
        </div>
      </div>
    </header>
  );
}
