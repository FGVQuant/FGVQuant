import { getTranslations } from "next-intl/server";

// Phase 1 placeholder — replaced by the real home page in Phase 4.
export default async function HomePage() {
  const t = await getTranslations("Home");
  return (
    <main id="content" className="relative isolate flex flex-1 items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="container-page py-32">
        <h1 className="font-display text-5xl tracking-tight text-balance md:text-7xl">
          {t("placeholderTitle")}
        </h1>
        <p className="mt-6 font-mono text-sm text-muted-foreground">{t("placeholderBody")}</p>
      </div>
    </main>
  );
}
