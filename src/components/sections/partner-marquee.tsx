import { LogoMarquee } from "@/components/sections/logo-marquee";
import { getPartners } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Partner logo in one ink (black in light, white in dark); undefined when there's no logo yet. */
export function partnerLogo(p: { name: string; logo?: string }, className?: string) {
  return p.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.logo}
      alt={p.name}
      loading="lazy"
      className={cn("h-8 w-auto max-w-44 object-contain brightness-0 dark:invert", className)}
    />
  ) : undefined;
}

export function PartnerMarquee({ label, className }: { label: string; className?: string }) {
  return (
    <LogoMarquee
      label={label}
      className={className}
      items={getPartners().map((p) => ({ name: p.name, href: p.url, logo: partnerLogo(p) }))}
    />
  );
}
