import type { MetadataRoute } from "next";
import { resolveAppEnv } from "@/lib/app-env";

export const dynamic = "force-dynamic";

/**
 * robots.txt: only production may be crawled (public landing, help and legal pages); the
 * signed-in app and token routes never. Every other mode – local demo, online preview
 * (PRD Q25), staging – disallows everything (deployment.md §0.1, §0.7).
 */
export default function robots(): MetadataRoute.Robots {
  if (resolveAppEnv() !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/trips", "/i/", "/login", "/auth/", "/account", "/api/", "/demo/"],
    },
  };
}
