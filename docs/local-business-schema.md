# LocalBusiness Schema Markup — Homescape Construction

Add this JSON-LD to the `<head>` of every page on the site. Update the `makesOffer` array if services change.

## Base LocalBusiness Schema

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://www.homescapeconstruction.com/#organization",
  "name": "Homescape Construction Inc.",
  "url": "https://www.homescapeconstruction.com",
  "logo": "https://www.homescapeconstruction.com/logo.png",
  "image": "https://www.homescapeconstruction.com/og-image.jpg",
  "description": "Owner-operated home builder and remodeling contractor serving Chicago and suburbs for 20+ years. Custom homes, kitchen and bathroom remodeling, additions, basement finishing, and ADU construction.",
  "telephone": "+1-773-934-0589",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "",
    "addressLocality": "Chicago",
    "addressRegion": "IL",
    "postalCode": "60614",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.8781,
    "longitude": -87.6298
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "17:00"
  },
  "priceRange": "$$$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Cash, Check, Credit Card",
  "areaServed": [
    {
      "@type": "City",
      "name": "Chicago",
      "sameAs": "https://en.wikipedia.org/wiki/Chicago"
    },
    { "@type": "Place", "name": "Lincoln Park, Chicago" },
    { "@type": "Place", "name": "Wicker Park, Chicago" },
    { "@type": "Place", "name": "Lakeview, Chicago" },
    { "@type": "Place", "name": "Logan Square, Chicago" },
    { "@type": "Place", "name": "Bucktown, Chicago" },
    { "@type": "City", "name": "Riverside, IL" },
    { "@type": "City", "name": "Broadview, IL" },
    { "@type": "City", "name": "North Riverside, IL" },
    { "@type": "City", "name": "Oak Park, IL" },
    { "@type": "City", "name": "Berwyn, IL" },
    { "@type": "City", "name": "Evanston, IL" },
    { "@type": "City", "name": "Park Ridge, IL" },
    { "@type": "City", "name": "Niles, IL" },
    { "@type": "City", "name": "Skokie, IL" }
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Custom Home Building",
        "description": "New construction and tear-down-and-rebuild projects across Chicago and suburbs.",
        "url": "https://www.homescapeconstruction.com/blog/custom-home-builds-chicago-suburbs"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Kitchen Remodeling",
        "description": "Full kitchen renovations including cabinetry, countertops, flooring, lighting, and plumbing.",
        "url": "https://www.homescapeconstruction.com/blog/kitchen-bathroom-remodeling-chicago"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Bathroom Remodeling",
        "description": "Custom tile work, shower and tub installation, vanity design, and accessibility upgrades.",
        "url": "https://www.homescapeconstruction.com/blog/kitchen-bathroom-remodeling-chicago"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Home Additions",
        "description": "Room additions, second-story additions, and structural expansions.",
        "url": "https://www.homescapeconstruction.com/blog/home-additions-basement-finishing-chicago"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Basement Finishing",
        "description": "Full basement build-outs including framing, electrical, plumbing, drywall, and flooring.",
        "url": "https://www.homescapeconstruction.com/blog/home-additions-basement-finishing-chicago"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "ADU & Garage Conversions",
        "description": "Accessory dwelling unit construction and garage conversions compliant with Chicago zoning.",
        "url": "https://www.homescapeconstruction.com/blog/home-additions-basement-finishing-chicago"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "General Contracting",
        "description": "Licensed general contracting and project management for residential construction.",
        "url": "https://www.homescapeconstruction.com"
      }
    }
  ],
  "foundingDate": "2010",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "minValue": 2,
    "maxValue": 10
  },
  "sameAs": [
    "https://www.facebook.com/p/Homescape-Construction-Inc-100057514995369/",
    "https://www.houzz.com/professionals/general-contractors/homescape-construction-inc-pfvwus-pf~916826852",
    "https://www.bbb.org/us/il/chicago/profile/construction-services/homescape-construction-inc-0654-90023681"
  ]
}
```

## Per-Service Page Schema

Add this to individual service pages alongside the base schema. Swap `name`, `description`, and `url` for each page.

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom Home Building in Chicago",
  "description": "New construction, tear-down rebuilds, and design-build projects across Chicago and suburbs. 20+ years experience. Free estimates.",
  "provider": {
    "@id": "https://www.homescapeconstruction.com/#organization"
  },
  "areaServed": {
    "@type": "State",
    "name": "Illinois"
  },
  "url": "https://www.homescapeconstruction.com/blog/custom-home-builds-chicago-suburbs"
}
```

## FAQ Schema (Add to Any Page with Q&A Content)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does it cost to build a custom home in Chicago?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Custom home construction in Chicago typically ranges from $250 to $450+ per square foot, depending on lot size, design complexity, material selections, and neighborhood. Homescape Construction provides transparent, line-item estimates."
      }
    },
    {
      "@type": "Question",
      "name": "How long does a kitchen remodel take in Chicago?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A full kitchen remodel in Chicago typically takes 8 to 14 weeks depending on scope and material lead times."
      }
    },
    {
      "@type": "Question",
      "name": "What areas does Homescape Construction serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Homescape Construction serves Chicago and surrounding suburbs including Riverside, Broadview, Oak Park, Berwyn, Harwood Heights, Evanston, Park Ridge, Niles, Skokie, and many more communities across Chicagoland."
      }
    },
    {
      "@type": "Question",
      "name": "How much does basement finishing cost in Chicago?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Basement finishing costs in Chicago typically range from $40 to $75 per square foot depending on the level of finish, plumbing requirements, and material selections."
      }
    }
  ]
}
```

## Implementation Notes

- Wrap each JSON-LD block in `<script type="application/ld+json">...</script>` tags in the page `<head>`
- Use Google's Rich Results Test (https://search.google.com/test/rich-results) to validate after deployment
- The `@id` reference in Service schema links back to the base LocalBusiness entity — this tells Google they are related
- Update `streetAddress` with the actual street address if you want it displayed in search results
- Update `logo` and `image` URLs to match your actual asset paths
- Add `aggregateRating` once you have enough Google reviews to surface star ratings in search
