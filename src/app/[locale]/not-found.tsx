import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <main
      id="content"
      className="container-page flex flex-1 flex-col items-start justify-center py-32"
    >
      <p className="font-mono text-sm text-highlight">404 · σ &gt; 3</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-prose text-muted-foreground">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-border-strong px-5 py-2 text-sm transition-colors hover:bg-accent"
      >
        {t("back")}
      </Link>
    </main>
  );
}
