import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const PAGES = ["", "/diagnose.html", "/fix.html", "/grow.html", "/engine.html", "/pricing.html",
  "/privacy/", "/terms/", "/data-deletion/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE.url}${path}`, changeFrequency: "monthly" }));
}
