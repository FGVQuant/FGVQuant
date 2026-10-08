export type NavKey =
  "about" | "newsletter" | "team" | "capital" | "competitions" | "events" | "partners";

export type NavItem = { key: NavKey; href: string };

export const JOIN_HREF = "/processo-seletivo";

export const navItems: readonly NavItem[] = [
  { key: "about", href: "/sobre" },
  { key: "newsletter", href: "/newsletter" },
  { key: "team", href: "/time" },
  { key: "capital", href: "/capital" },
  { key: "competitions", href: "/competicoes" },
  { key: "events", href: "/eventos" },
  { key: "partners", href: "/parceiros" },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
