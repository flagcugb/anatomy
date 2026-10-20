import type { NextConfig } from "next";
import { defaultLocale } from "./app/i18n/config";

const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isStaticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        ...(basePath ? { basePath } : {}),
      }
    : {
        // Every route lives under /[locale], so `app/[locale]/layout.tsx` is the
        // root layout and there is no page at `/`. Send bare visits to the
        // default language. (Accept-Language negotiation would need middleware,
        // which the Cloudflare/vinext target does not run — the in-app switcher
        // covers it.) Static export cannot use redirects(); pack writes
        // out/index.html instead.
        async redirects() {
          return [
            { source: "/", destination: `/${defaultLocale}`, permanent: false },
          ];
        },
      }),
};

export default nextConfig;
