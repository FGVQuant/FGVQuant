import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getTestimonials, tr } from "@/lib/content";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { deriveInitials } from "@/components/cards/member-card";

/**
 * Members' own accounts of the league (content/testimonials.json). A quote linked to a team member
 * reuses their name and photo. Seats without text yet stay explicit ("a confirmar"), never filled
 * with invented quotes. On /en a quote without an English version shows in Portuguese, marked lang="pt".
 */
export async function Testimonials({ locale }: { locale: Locale }) {
  const t = await getTranslations("About.testimonials");
  const tCommon = await getTranslations("Common");
  const items = getTestimonials();
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="container-page section-y">
        <SectionHeader
          title={t("title")}
          description={t("description")}
          action={
            <ButtonLink href="/equipe" variant="outline" arrow>
              {t("teamCta")}
            </ButtonLink>
          }
        />

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const pending = item.placeholder || !item.quote;
            const quote = item.quote ? (locale === "en" ? item.quote.en : undefined) : undefined;
            const text = quote ?? item.quote?.pt;
            const name = item.person?.name ?? item.name;
            const photo = item.person?.photo;
            return (
              <li key={item.id}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <span
                    aria-hidden
                    className="font-display text-6xl leading-none text-highlight/50 select-none"
                  >
                    “
                  </span>
                  <blockquote
                    lang={!pending && locale === "en" && !quote ? "pt" : undefined}
                    className={
                      pending
                        ? "mt-2 flex-1 text-lg text-muted-foreground"
                        : "mt-2 flex-1 font-display text-xl leading-relaxed text-pretty text-foreground sm:text-2xl"
                    }
                  >
                    {pending ? t("quoteTbd") : text}
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <span
                      aria-hidden
                      className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-display text-lavender-300"
                    >
                      {photo && !pending ? (
                        <Image
                          src={photo.src}
                          alt=""
                          width={photo.width}
                          height={photo.height}
                          sizes="48px"
                          className="absolute inset-0 size-full object-cover object-[50%_30%]"
                        />
                      ) : pending || !name ? (
                        "?"
                      ) : (
                        deriveInitials(name)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={
                          pending || !name
                            ? "font-semibold text-muted-foreground"
                            : "font-semibold text-foreground"
                        }
                      >
                        {pending || !name ? t("nameTbd") : name}
                      </p>
                      {item.context && !pending ? (
                        <p className="text-sm text-muted-foreground">{tr(item.context, locale)}</p>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>

        {items.some((i) => i.placeholder || !i.quote) ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-6">
            {t("pending")}
          </PlaceholderNote>
        ) : null}
      </div>
    </section>
  );
}
