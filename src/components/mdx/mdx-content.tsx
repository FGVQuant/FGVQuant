import * as runtime from "react/jsx-runtime";
import { TailRiskFigure } from "./tail-risk-figure";
import { createElement, isValidElement, type ComponentProps, type ReactNode } from "react";
import { ArrowUpRight, Info, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import "./prose.css";

/** Plain text of a React subtree (used to derive heading ids). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** "Notícias & Radar" → "noticias-radar" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function MdxLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <ArrowUpRight aria-hidden className="ml-0.5 inline size-[0.85em] align-[-0.1em]" />
    </a>
  );
}

function heading(Tag: "h2" | "h3") {
  function Heading({ children, id, ...rest }: ComponentProps<"h2">) {
    const slug = id ?? (slugify(textOf(children)) || undefined);
    return (
      <Tag id={slug} className="group scroll-mt-24" {...rest}>
        {children}
        {slug ? (
          <a
            href={`#${slug}`}
            data-anchor
            aria-label="Link"
            className="ml-2 text-highlight no-underline opacity-0 transition-opacity group-hover:opacity-70 focus-visible:opacity-100"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  }
  Heading.displayName = Tag.toUpperCase();
  return Heading;
}

function MdxImage({ alt = "", src, ...rest }: ComponentProps<"img">) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" {...rest} />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

function MdxTable(props: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}

export function Callout({
  tone = "note",
  children,
  className,
}: {
  tone?: "note" | "warning";
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <aside
      role="note"
      data-tone={tone}
      className={cn(
        "my-8 flex gap-3 rounded-xl border p-4 text-[0.95rem] leading-relaxed",
        tone === "warning"
          ? "border-destructive/40 bg-destructive/10"
          : "border-border-strong bg-accent",
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-5 shrink-0",
          tone === "warning" ? "text-destructive" : "text-highlight",
        )}
      />
      <div className="min-w-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </aside>
  );
}

const defaultComponents = {
  a: MdxLink,
  h2: heading("h2"),
  h3: heading("h3"),
  img: MdxImage,
  table: MdxTable,
  Callout,
  TailRiskFigure,
};

type MdxComponents = Record<string, React.ElementType>;

/** Evaluates a Velite `s.mdx()` function-body string with the React JSX runtime. */
function renderMdx(code: string, components: MdxComponents) {
  const fn = new Function(code);
  const Component = fn({ ...runtime }).default as React.ComponentType<{
    components?: MdxComponents;
  }>;
  return createElement(Component, { components });
}

export function MdxContent({
  code,
  components,
  className,
}: {
  code: string;
  components?: MdxComponents;
  className?: string;
}) {
  return (
    <div className={cn("prose-fq", className)}>
      {renderMdx(code, { ...defaultComponents, ...components })}
    </div>
  );
}
