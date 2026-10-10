import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-xs leading-none tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "border border-border-strong text-muted-foreground",
        highlight: "border border-highlight/30 bg-highlight/10 text-highlight",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/** Small mono pill label. */
export function Badge({
  variant,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
