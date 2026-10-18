import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";

const LABEL = /^([^:]{2,40}):\s+/;

/**
 * List override for an issue summary: a list whose items read "Seção: conteúdo" (the "Nesta edição"
 * list) renders as a contents table, section on the left; any other list stays a plain list.
 */
export function IssueContents({ children, ...rest }: ComponentProps<"ul">) {
  const items = Children.toArray(children)
    .filter(isValidElement<{ children?: ReactNode }>)
    .map((li) => {
      const [first, ...more] = Children.toArray(li.props.children);
      const m = typeof first === "string" ? first.match(LABEL) : null;
      return m && typeof first === "string"
        ? { label: m[1], body: [first.slice(m[0].length), ...more] }
        : { label: "", body: li.props.children };
    });
  if (items.filter((i) => i.label).length < 2) return <ul {...rest}>{children}</ul>;
  return (
    <dl className="not-prose my-8 divide-y divide-border border-y border-border">
      {items.map((item, i) => (
        <div key={i} className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
          <dt className="text-sm leading-7 font-medium text-highlight">{item.label}</dt>
          <dd className="leading-7 text-foreground">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}
