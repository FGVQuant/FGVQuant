import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAreas, getTeam, tr } from "@/lib/content";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { MemberCard } from "@/components/cards/member-card";

/**
 * Leadership and members, folded into Sobre while the roster is mostly pending (it was the
 * standalone /time page, which now redirects to #time). Confirmed members render as cards;
 * seats still awaiting names and consent render as a compact list with an honest pending note.
 */
export async function TeamSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("Team");
  const tCommon = await getTranslations("Common");
  const all = getTeam();
  const members = all.filter((m) => !m.placeholder);
  const pendingRoles = all.filter((m) => m.placeholder);
  const areaLabels = new Map(getAreas().map((a) => [a.id, tr(a.title, locale)]));

  return (
    <section id="time" className="scroll-mt-24 border-t border-border">
      <div className="container-page grid gap-12 section-y lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeader
            title={t.rich("leadership.title", { em: (chunks) => chunks })}
            description={t("leadership.description")}
          />
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            {t("alumni.body")} <span className="text-sm">{t("alumni.selfReported")}</span>
          </p>
          <ButtonLink href="/eventos#competicoes" variant="link" arrow className="mt-4">
            {t("alumni.cta")}
          </ButtonLink>
        </div>

        <div>
          {members.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {members.map((m) => (
                <li key={m.id}>
                  <MemberCard
                    name={m.name}
                    role={tr(m.role, locale)}
                    area={m.area ? (areaLabels.get(m.area) ?? m.area) : undefined}
                    photo={m.photo ? { ...m.photo, alt: m.name } : undefined}
                    linkedin={m.linkedin}
                    linkedinLabel={t("linkedinLabel", { name: m.name })}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {pendingRoles.length > 0 ? (
            <>
              <ul
                className={`divide-y divide-border overflow-hidden rounded-2xl bg-card ${members.length > 0 ? "mt-10" : ""}`}
              >
                {pendingRoles.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4"
                  >
                    <div>
                      <p className="font-sans text-lg font-semibold tracking-tight text-foreground">
                        {tr(m.role, locale)}
                      </p>
                      {m.area ? (
                        <p className="text-sm text-muted-foreground">
                          {areaLabels.get(m.area) ?? m.area}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm text-muted-foreground">{t("nameTbd")}</span>
                  </li>
                ))}
              </ul>
              <PlaceholderNote label={tCommon("pending")} className="mt-6">
                {t("pending")}
              </PlaceholderNote>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
