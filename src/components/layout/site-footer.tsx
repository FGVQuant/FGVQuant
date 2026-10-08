import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { JOIN_HREF, navItems } from "./nav-items";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

const follow = [
  { label: "Instagram", href: "https://www.instagram.com/fgvquant/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/fgvquant" },
  {
    label: null, // Footer.subscribe
    href: "https://www.linkedin.com/newsletters/fgv-quant-insights-7435439773789437952/",
  },
] as const;

const linkClass =
  "inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground";

export async function SiteFooter() {
  const [t, nav, brand, year] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getTranslations("Brand"),
    getYear(),
  ]);

  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo tagline={brand("tagline")} />
            <p className="mt-6 text-sm text-muted-foreground">{t("about")}</p>
            <p className="mt-4 font-mono text-xs text-highlight">{brand("motto")}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-wide text-foreground uppercase">
              {t("explore")}
            </h2>
            <ul className="mt-4 space-y-3">
              {navItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={linkClass}>
                    {nav(key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={JOIN_HREF} className={linkClass}>
                  {nav("join")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-wide text-foreground uppercase">
              {t("follow")}
            </h2>
            <ul className="mt-4 space-y-3">
              {follow.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {label ?? t("subscribe")}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-wide text-foreground uppercase">
              {t("contact")}
            </h2>
            {/* TODO(Phase 0.3): real email */}
            <p className="mt-4 inline-block rounded-md border border-dashed border-border-strong px-2 py-1 font-mono text-xs text-muted-foreground">
              contato@fgvquant — TBD
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between md:gap-8">
          <p>{t("rights", { year })}</p>
          <p className="max-w-xl md:text-right">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
