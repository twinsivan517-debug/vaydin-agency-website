import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const PAGES = ["", "/diagnose.html", "/fix.html", "/grow.html", "/engine.html", "/pricing.html",
  "/privacy/", "/terms/", "/data-deletion/"];

export default function sitemap(): MetadataRoute.Sitemap {
  /* The home page as its canonical says it: with the slash. */
  return PAGES.map((path) => ({ url: `${SITE.url}${path || "/"}`, changeFrequency: "monthly" }));
}
