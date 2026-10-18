export type NavKey =
  "about" | "team" | "newsletter" | "capital" | "events" | "projects" | "partners" | "join";

export type NavItem = { key: NavKey; href: string };

export const JOIN_HREF = "/processo-seletivo";
export const PARTNERS_HREF = "/parceiros";

const BASE: readonly NavItem[] = [
  { key: "about", href: "/sobre" },
  { key: "team", href: "/equipe" },
  { key: "newsletter", href: "/newsletter" },
  { key: "capital", href: "/capital" },
  { key: "events", href: "/eventos" },
  { key: "projects", href: "/projetos" },
];

/** Every public page, for the footer. */
export const allNavItems: readonly NavItem[] = [
  ...BASE,
  { key: "partners", href: PARTNERS_HREF },
  { key: "join", href: JOIN_HREF },
];

/** Header navigation: recruitment is the filled call to action; partners is a plain link. */
export const headerNav: { items: NavItem[]; cta: NavItem } = {
  items: [...BASE, { key: "partners", href: PARTNERS_HREF }],
  cta: { key: "join", href: JOIN_HREF },
};

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
