import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";

/** "Quer fazer parte" band shared by Home and Sobre: text left, button right. */
export async function JoinCta() {
  const t = await getTranslations("About");
  return (
    <section className="border-t border-border">
      <div className="container-page section-y">
        <div className="flex flex-col gap-6 rounded-2xl bg-card p-6 md:flex-row md:items-center md:justify-between md:px-10 md:py-8">
          <div>
            <h2 className="font-display text-2xl text-balance md:text-3xl">
              {t.rich("cta.title", { em: (chunks) => chunks })}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("cta.body")}</p>
          </div>
          <ButtonLink
            href="/processo-seletivo"
            size="lg"
            arrow
            className="shrink-0 self-start md:self-auto"
          >
            {t("cta.button")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
