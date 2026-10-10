import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Shared button styling. Use directly for custom elements. */
export const buttonVariants = cva(
  "group/btn inline-flex max-w-full items-center justify-center gap-2 whitespace-normal text-center font-medium transition-[background-color,color,border-color,opacity] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "rounded-full bg-primary text-primary-foreground hover:opacity-90",
        outline:
          "rounded-full border border-border-strong bg-transparent text-foreground hover:bg-accent",
        ghost: "rounded-full text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "rounded-sm text-highlight underline-offset-4 hover:underline",
      },
      size: {
        sm: "min-h-9 px-4 py-1.5 text-sm",
        md: "min-h-11 px-6 py-2 text-sm",
        lg: "min-h-12 px-8 py-2.5 text-base",
        icon: "size-10",
      },
    },
    compoundVariants: [{ variant: "link", className: "min-h-0 px-0 py-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type BaseProps = VariantProps<typeof buttonVariants> & {
  /** Show a trailing arrow that nudges right on hover. */
  arrow?: boolean;
  children?: ReactNode;
};

function Arrow() {
  return (
    <ArrowRight
      aria-hidden
      className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 motion-reduce:transition-none"
    />
  );
}

/** Native `<button>` with brand variants. */
export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  type = "button",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
      {arrow ? <Arrow /> : null}
    </button>
  );
}

/** Locale-aware internal link styled as a button. */
export function ButtonLink({
  variant,
  size,
  arrow,
  className,
  children,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

/** External `<a>` (opens in a new tab) styled as a button. */
export function ButtonAnchor({
  variant,
  size,
  arrow,
  className,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
  newTabLabel,
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { newTabLabel?: string }) {
  const t = useTranslations("Common");
  newTabLabel ??= t("newTab");
  return (
    <a
      target={target}
      rel={rel}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {arrow ? <Arrow /> : null}
      {target === "_blank" ? <span className="sr-only">{newTabLabel}</span> : null}
    </a>
  );
}
