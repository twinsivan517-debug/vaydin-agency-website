import type { MetadataRoute } from "next";
import { LISTED, SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!LISTED) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
