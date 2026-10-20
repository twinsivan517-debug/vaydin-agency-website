import type { Metadata, Viewport } from "next";
import { Geist, Marcellus } from "next/font/google";
import { LISTED, SITE } from "@/lib/site";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: we find the patients your clinic never saw`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: [{ url: "/vaydin-og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  ...(LISTED ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0d0807" };

/* GitHub Pages sets no security headers on a custom domain; the referrer
   policy is the one that works as a meta tag. */
const REFERRER = "strict-origin-when-cross-origin";

/* The organisation record, saying what the page itself says: the shopper is
   a person, so no bots in it. */
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
    "Vaydin is a Dubai company for aesthetic and wellness clinics in the UAE and the GCC. We measure how a clinic looks to a new patient, then run its front door: WhatsApp, Google, reviews, Instagram and the website.",
  areaServed: { "@type": "Place", name: "MENA" },
  email: SITE.email,
  /* Profiles that are ours and answer: they tell a search engine which
     "Vaydin" this is. */
  sameAs: ["https://www.instagram.com/vaydin.agency/"],
};

/* The site as an entity of its own, so a search engine ties the name to
   this address. */
const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: ["Vaydin Agency", "vaydin.agency"],
  url: `${SITE.url}/`,
  publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.url}/` },
  inLanguage: "en",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <head>
        <meta name="referrer" content={REFERRER} />
      </head>
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }} />
        {children}
      </body>
    </html>
  );
}
