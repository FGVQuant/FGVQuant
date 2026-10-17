import type { MetadataRoute } from "next";
import { getIssues } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/sobre",
  "/newsletter",
  "/time",
  "/processo-seletivo",
  "/capital",
  "/desafios",
  "/eventos",
  "/parceiros",
];

const url = (locale: "pt" | "en", path: string) =>
  `${SITE_URL}${locale === "en" ? "/en" : ""}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { path: string; lastModified?: Date }[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...getIssues().map((issue) => ({
      path: `/newsletter/${issue.slug}`,
      lastModified: issue.date ? new Date(issue.date) : undefined,
    })),
  ];

  return entries.flatMap(({ path, lastModified }) => {
    const languages = { pt: url("pt", path), en: url("en", path) };
    return (["pt", "en"] as const).map((locale) => ({
      url: languages[locale],
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}
