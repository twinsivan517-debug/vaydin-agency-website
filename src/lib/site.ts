import site from "../../site.json";

export type Tier = "static" | "motion" | "3d";

export const SITE = site as {
  name: string;
  tier: Tier;
  url: string;
  description: string;
  email: string;
};
