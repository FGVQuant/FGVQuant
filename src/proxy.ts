import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed middleware.ts -> proxy.ts. Rewrites "/x" to "/pt/x" and serves "/en/x" as-is.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and any path with a file extension (icons, brand assets).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
