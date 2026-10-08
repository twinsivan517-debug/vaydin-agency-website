import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PAGES = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE.url}${path}`, changeFrequency: "monthly" }));
}
