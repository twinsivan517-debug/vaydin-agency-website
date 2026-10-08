import type { Metadata, Viewport } from "next";
import { Geist, Marcellus } from "next/font/google";
import { LISTED, SITE } from "@/lib/site";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — we find the patients your clinic never saw`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, type: "website" },
  ...(LISTED ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0d0807" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
