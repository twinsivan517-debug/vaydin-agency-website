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
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    type: "website",
    images: [{ url: "/vaydin-og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  ...(LISTED ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0d0807" };

/* The organisation record the live home page carries, word for word. */
const ORGANISATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: "VAYDIN PARTNERS INVESTMENTS - FZCO",
  telephone: "+971505553148",
  address: {
    "@type": "PostalAddress",
    streetAddress: "DSO-IFZA, IFZA Properties",
    addressLocality: "Dubai Silicon Oasis",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  url: `${SITE.url}/`,
  logo: `${SITE.url}/vaydin-icon-512.png`,
  image: `${SITE.url}/vaydin-og.png`,
  description:
    "Vaydin builds the operating system for aesthetic clinics — diagnostic-led mystery shopping, AI response bots, booking integration, attribution-tracked acquisition. Designed in Dubai. Built for MENA. Operated for you.",
  sameAs: ["https://reports.vaydin.agency/"],
  areaServed: { "@type": "Place", name: "MENA" },
  email: SITE.email,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION) }} />
        {children}
      </body>
    </html>
  );
}
