import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import QuickContact from "@/components/QuickContact";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

// JSON-LD Schema for LocalBusiness (GEO optimization)
function LocalBusinessSchema({ settings }: { settings: SiteSettings }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: settings.companyName || "Homescape Construction Inc.",
    description: settings.tagline || "Chicago-based residential and commercial construction company",
    foundingDate: "2012",
    areaServed: {
      "@type": "City",
      name: "Chicago",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chicago",
      addressRegion: "IL",
      addressCountry: "US",
    },
    telephone: settings.phone,
    email: settings.email,
    url: "https://homescapeconstruction.com",
    sameAs: [
      settings.social?.facebook,
      settings.social?.instagram,
      settings.social?.linkedin,
    ].filter(Boolean),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "200",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const metadata: Metadata = {
  metadataBase: new URL("https://homescapeconstruction.com"),
  title: {
    default: "Homescape Construction Inc. | Chicago Residential & Commercial Construction",
    template: "%s | Homescape Construction",
  },
  description:
    "Homescape Construction Inc. is a Chicago-based residential and commercial construction company founded in 2012. We specialize in custom home builds, kitchen and bathroom remodels, and commercial tenant improvements throughout the greater Chicago metropolitan area.",
  keywords: [
    "Chicago construction company",
    "residential construction Chicago",
    "commercial construction Illinois",
    "home remodeling Chicago",
    "kitchen remodel Chicago",
    "bathroom renovation",
    "custom home builder",
    "Lincoln Park contractor",
    "Wicker Park construction",
  ],
  authors: [{ name: "Homescape Construction Inc." }],
  creator: "Homescape Construction Inc.",
  publisher: "Homescape Construction Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://homescapeconstruction.com",
    siteName: "Homescape Construction Inc.",
    title: "Homescape Construction Inc. | Chicago Residential & Commercial Construction",
    description:
      "Chicago-based residential and commercial construction company. Custom homes, renovations, and commercial builds since 2012.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Homescape Construction - Quality Craftsmanship in Chicago",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homescape Construction Inc.",
    description: "Chicago residential & commercial construction since 2012",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://homescapeconstruction.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await sanityFetch<SiteSettings>(queries.siteSettings);

  return (
    <html lang="en" data-theme="green" suppressHydrationWarning>
      <head>
        <LocalBusinessSchema settings={siteSettings} />
      </head>
      <body>
        <ThemeProvider>
          <Nav />
          <main>{children}</main>
          <Footer siteSettings={siteSettings} />
          <QuickContact />
        </ThemeProvider>
      </body>
    </html>
  );
}
