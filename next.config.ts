import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Plain files for GitHub Pages: no server, so no image resizing either. */
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
