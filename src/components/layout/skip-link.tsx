import { getTranslations } from "next-intl/server";

export async function SkipLink() {
  const t = await getTranslations("Nav");
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
    >
      {t("skipToContent")}
    </a>
  );
}
