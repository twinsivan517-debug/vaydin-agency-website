import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/* The legal pages are not here: they carry noindex,follow (public/privacy,
   public/terms, public/data-deletion), and Search Console reported the
   contradiction of a sitemap listing pages it may not index (2026-10-26). */
const PAGES = ["", "/diagnose.html", "/fix.html", "/grow.html", "/engine.html", "/pricing.html"];

export default function sitemap(): MetadataRoute.Sitemap {
  /* The home page as its canonical says it: with the slash. */
  return PAGES.map((path) => ({ url: `${SITE.url}${path || "/"}`, changeFrequency: "monthly" }));
}
