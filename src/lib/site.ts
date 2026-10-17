import site from "../../site.json";

export type Tier = "static" | "motion" | "3d";

export const SITE = site as {
  name: string;
  tier: Tier;
  url: string;
  description: string;
  email: string;
};

/* A site with no real address yet is a demo: search engines are told to stay out. */
export const LISTED = new URL(SITE.url).hostname !== "example.com";

export const WHATSAPP = "https://wa.me/971505553148";
export const WHATSAPP_SHOWN = "+971 50 555 3148";

/* The five pages behind the home page, at the addresses they have had since
   the first site, so no link on the web breaks. */
export const PAGES: [string, string][] = [
  ["Diagnose", "/diagnose.html"],
  ["Fix", "/fix.html"],
  ["Grow", "/grow.html"],
  ["Engine", "/engine.html"],
  ["Pricing", "/pricing.html"],
];
