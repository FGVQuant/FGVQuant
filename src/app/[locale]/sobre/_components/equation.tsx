import katex from "katex";

const TEX = String.raw`dS_t = \mu S_t\,dt + \sigma S_t\,dW_t`;

/**
 * Static display equation (geometric Brownian motion). Input is a trusted constant.
 * Rendered as native MathML (supported by every browser in our browserslist), so this page needs
 * no KaTeX stylesheet or fonts — that CSS was render-blocking on mobile for a below-the-fold flourish.
 */
export function Equation({ caption, label }: { caption: string; label: string }) {
  const html = katex.renderToString(TEX, {
    displayMode: true,
    output: "mathml",
    throwOnError: false,
  });
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-border px-6 py-12 text-center glass sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
      <div
        tabIndex={0}
        role="group"
        aria-label={label}
        className="overflow-x-auto overflow-y-hidden rounded py-2 font-serif text-2xl text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-4xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <figcaption className="mt-6 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}
