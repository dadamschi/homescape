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
    "@id": "https://www.homescapeconstruction.com/#organization",
    name: settings.companyName || "Homescape Construction Inc.",
    description:
      "Owner-operated home builder and remodeling contractor serving Chicago and suburbs for 20+ years. Custom homes, kitchen and bathroom remodeling, additions, basement finishing, and ADU construction.",
    url: "https://www.homescapeconstruction.com",
    logo: "https://www.homescapeconstruction.com/logo.png",
    image: "https://www.homescapeconstruction.com/og-image.jpg",
    email: settings.email,
    // Direct users to contact form instead of phone
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://www.homescapeconstruction.com/contact",
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60614",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.8781,
      longitude: -87.6298,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    priceRange: "$$$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Check, Credit Card",
    areaServed: [
      { "@type": "City", name: "Chicago", sameAs: "https://en.wikipedia.org/wiki/Chicago" },
      { "@type": "Place", name: "Lincoln Park, Chicago" },
      { "@type": "Place", name: "Wicker Park, Chicago" },
      { "@type": "Place", name: "Lakeview, Chicago" },
      { "@type": "Place", name: "Logan Square, Chicago" },
      { "@type": "Place", name: "Bucktown, Chicago" },
      { "@type": "Place", name: "Edgewater, Chicago" },
      { "@type": "Place", name: "West Town, Chicago" },
      { "@type": "Place", name: "New Eastside, Chicago" },
      { "@type": "Place", name: "West Loop, Chicago" },
      { "@type": "Place", name: "Ukrainian Village, Chicago" },
      { "@type": "Place", name: "Humboldt Park, Chicago" },
      { "@type": "Place", name: "Palmer Square, Chicago" },
      { "@type": "Place", name: "Avondale, Chicago" },
      { "@type": "Place", name: "Roscoe Village, Chicago" },
      { "@type": "Place", name: "Buena Park, Chicago" },
      { "@type": "Place", name: "Uptown, Chicago" },
      { "@type": "Place", name: "Ravenswood Manor, Chicago" },
      { "@type": "Place", name: "Lincoln Square, Chicago" },
      { "@type": "Place", name: "Andersonville, Chicago" },
      { "@type": "Place", name: "Irving Park, Chicago" },
      { "@type": "Place", name: "Portage Park, Chicago" },
      { "@type": "City", name: "Riverside, IL" },
      { "@type": "City", name: "North Riverside, IL" },
      { "@type": "City", name: "Oak Park, IL" },
      { "@type": "City", name: "Berwyn, IL" },
      { "@type": "City", name: "Evanston, IL" },
      { "@type": "City", name: "Park Ridge, IL" },
      { "@type": "City", name: "Niles, IL" },
      { "@type": "City", name: "Skokie, IL" }
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Home Building",
          description: "New construction and tear-down-and-rebuild projects across Chicago and suburbs.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kitchen Remodeling",
          description: "Full kitchen renovations including cabinetry, countertops, flooring, lighting, and plumbing.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bathroom Remodeling",
          description: "Custom tile work, shower and tub installation, vanity design, and accessibility upgrades.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Home Additions",
          description: "Room additions, second-story additions, and structural expansions.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Basement Finishing",
          description: "Full basement build-outs including framing, electrical, plumbing, drywall, and flooring.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "ADU & Garage Conversions",
          description: "Accessory dwelling unit construction and garage conversions compliant with Chicago zoning.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "General Contracting",
          description: "Licensed general contracting and project management for residential construction.",
        },
      },
    ],
    foundingDate: "2012",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 2,
      maxValue: 10,
    },
    sameAs: [
      "https://www.facebook.com/p/Homescape-Construction-Inc-100057514995369/",
      "https://www.houzz.com/professionals/general-contractors/homescape-construction-inc-pfvwus-pf~916826852",
      "https://www.bbb.org/us/il/chicago/profile/construction-services/homescape-construction-inc-0654-90023681",
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
    "Lakeview contractor",
    "Logan Square contractor",
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
