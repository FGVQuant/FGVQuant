import katex from "katex";
import "katex/dist/katex.min.css";

const TEX = String.raw`dS_t = \mu S_t\,dt + \sigma S_t\,dW_t`;

/** Static display equation (geometric Brownian motion). Input is a trusted constant. */
export function Equation({ caption }: { caption: string }) {
  const html = katex.renderToString(TEX, { displayMode: true, throwOnError: false });
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-border px-6 py-12 text-center glass sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
      <div
        className="overflow-x-auto text-2xl text-foreground sm:text-4xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <figcaption className="mt-6 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}
