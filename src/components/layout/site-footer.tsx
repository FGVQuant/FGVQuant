import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { getSite } from "@/lib/content";
import { allNavItems } from "./nav-items";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

const linkClass =
  "inline-flex items-center gap-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground";

export async function SiteFooter() {
  const [t, nav, brand, common, year] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getTranslations("Brand"),
    getTranslations("Common"),
    getYear(),
  ]);
  const newTabLabel = common("newTab");
  const site = getSite();
  const follow = [
    { label: "Instagram", href: site.instagram },
    { label: "LinkedIn", href: site.linkedin },
    { label: t("subscribe"), href: site.newsletterUrl },
  ];

  return (
    <footer className="mt-24 border-t border-border section-tone">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo tagline={brand("tagline")} />
            <p className="mt-6 text-sm text-muted-foreground">{t("about")}</p>
            <p className="mt-4 text-sm text-highlight">{brand("motto")}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("explore")}</h2>
            <ul className="mt-4 space-y-1">
              {allNavItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={linkClass}>
                    {nav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("follow")}</h2>
            <ul className="mt-4 space-y-1">
              {follow.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {label}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                    <span className="sr-only">{newTabLabel}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("contact")}</h2>
            {site.email ? (
              <a href={`mailto:${site.email}`} className={`mt-4 ${linkClass}`}>
                {site.email}
              </a>
            ) : (
              // email pending from the league (docs/INPUTS.md 0.3) — shown honestly as TBD
              <p className="mt-4 w-fit rounded-md border border-dashed border-border-strong px-2 py-1 text-xs text-muted-foreground">
                {t("emailPending")}
              </p>
            )}
            <Link href="/parceiros#contato" className={`mt-4 flex ${linkClass}`}>
              {t("allChannels")}
            </Link>
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
