export type NavKey = "about" | "team" | "newsletter" | "capital" | "events" | "partners" | "join";

export type NavItem = { key: NavKey; href: string };

export const JOIN_HREF = "/processo-seletivo";
export const PARTNERS_HREF = "/parceiros";

const BASE: readonly NavItem[] = [
  { key: "about", href: "/sobre" },
  { key: "team", href: "/equipe" },
  { key: "newsletter", href: "/newsletter" },
  { key: "capital", href: "/capital" },
  { key: "events", href: "/eventos" },
];

/** Every public page, for the footer. */
export const allNavItems: readonly NavItem[] = [
  ...BASE,
  { key: "partners", href: PARTNERS_HREF },
  { key: "join", href: JOIN_HREF },
];

/**
 * Header navigation. The filled call to action is the partner page while recruitment has no
 * dates (`recruitment.open` in content/site.json), and the recruitment page once it opens; the
 * other one stays in the link list so both are always one click away.
 */
export function getNav(recruitmentOpen: boolean): { items: NavItem[]; cta: NavItem } {
  return recruitmentOpen
    ? {
        items: [...BASE, { key: "partners", href: PARTNERS_HREF }],
        cta: { key: "join", href: JOIN_HREF },
      }
    : {
        items: [...BASE, { key: "join", href: JOIN_HREF }],
        cta: { key: "partners", href: PARTNERS_HREF },
      };
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
