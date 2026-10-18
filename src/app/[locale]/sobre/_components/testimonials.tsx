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

        {/* One full-width row per testimonial; the author side alternates left and right. */}
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {items.map((item) => {
            const pending = item.placeholder || !item.quote;
            const quote = item.quote ? (locale === "en" ? item.quote.en : undefined) : undefined;
            const text = quote ?? item.quote?.pt;
            const name = item.person?.name ?? item.name;
            const photo = item.person?.photo ?? item.photo;
            return (
              <li key={item.id} className="group">
                <figure className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:gap-14 md:group-even:flex-row-reverse">
                  <figcaption className="flex shrink-0 items-center gap-4 md:w-60 md:flex-col md:items-start md:gap-3 md:group-even:items-end md:group-even:text-right">
                    <span
                      aria-hidden
                      className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-display text-lavender-300 ring-1 ring-border md:size-20"
                    >
                      {photo && !pending ? (
                        <Image
                          src={photo.src}
                          alt=""
                          width={photo.width}
                          height={photo.height}
                          sizes="80px"
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
                        <p className="mt-0.5 text-sm leading-snug text-highlight">
                          {tr(item.context, locale)}
                        </p>
                      ) : null}
                    </div>
                  </figcaption>
                  <blockquote
                    lang={!pending && locale === "en" && !quote ? "pt" : undefined}
                    className="max-w-none flex-1 font-display text-lg leading-relaxed text-pretty text-foreground/90 italic md:text-xl"
                  >
                    {pending ? t("quoteTbd") : <p className="max-w-none">“{text}”</p>}
                  </blockquote>
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
