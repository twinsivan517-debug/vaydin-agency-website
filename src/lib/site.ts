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
