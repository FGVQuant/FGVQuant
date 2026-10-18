"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { isActive, type NavItem } from "./nav-items";
import { LocaleSwitch } from "./locale-switch";
import { ThemeToggle } from "./theme-toggle";

const noopSubscribe = () => () => {};
const PANEL_ID = "mobile-nav-panel";

export function MobileNav({ items, cta }: { items: NavItem[]; cta: NavItem }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  // Open state is tied to the route it was opened on, so any navigation closes it.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const routeKey = `${locale}:${pathname}`;
  const open = openKey === routeKey;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const inerted = [
      document.getElementById("content"),
      ...Array.from(document.querySelectorAll("body > header, body > footer, header, footer")),
    ].filter(
      (el, i, a): el is HTMLElement =>
        !!el && a.indexOf(el) === i && !el.contains(panelRef.current),
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenKey(null);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
      button?.focus();
    };
  }, [open]);

  // Menu: 240ms in, 160ms out (exits faster than entrances). Under reduced motion the panel
  // still fades, it just doesn't travel.
  const duration = 0.24;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenKey(routeKey)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={t("openMenu")}
        className="inline-flex size-9 pressable items-center justify-center rounded-full border border-border text-muted-foreground hover:border-border-strong hover:bg-accent hover:text-foreground xl:hidden"
      >
        <Menu className="size-4" aria-hidden />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open ? (
              <motion.div
                key="panel"
                ref={panelRef}
                id={PANEL_ID}
                role="dialog"
                aria-modal="true"
                aria-label={t("label")}
                initial={{ opacity: 0, y: reduce ? 0 : -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: reduce ? 0 : -12,
                  transition: { duration: 0.16, ease: EASE_OUT },
                }}
                transition={{ duration, ease: EASE_OUT }}
                className="fixed inset-0 z-50 flex h-dvh flex-col overflow-y-auto bg-background xl:hidden"
              >
                <div className="relative container-page flex h-16 shrink-0 items-center justify-between">
                  <Link href="/" aria-label="FGV Quant">
                    <Logo />
                  </Link>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpenKey(null)}
                    aria-label={t("closeMenu")}
                    className="inline-flex size-9 pressable items-center justify-center rounded-full border border-border text-muted-foreground hover:border-border-strong hover:bg-accent hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>

                <nav aria-label={t("label")} className="relative container-page flex-1 py-8">
                  <ul className="flex flex-col">
                    {items.map(({ key, href }, i) => {
                      const active = isActive(pathname, href);
                      return (
                        <motion.li
                          key={key}
                          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration,
                            ease: EASE_OUT,
                            delay: reduce ? 0 : 0.05 + i * 0.03,
                          }}
                          className="border-b border-border"
                        >
                          <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between py-4 font-display text-3xl tracking-tight transition-colors",
                              active ? "text-highlight" : "text-foreground hover:text-highlight",
                            )}
                          >
                            {t(key)}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="relative container-page flex flex-col gap-5 pb-8">
                  <Link
                    href={cta.href}
                    className="inline-flex h-12 pressable items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-primary-foreground"
                  >
                    {t(cta.key)}
                  </Link>
                  <div className="flex items-center justify-between">
                    <LocaleSwitch />
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
