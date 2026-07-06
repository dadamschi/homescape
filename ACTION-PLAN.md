# SEO Action Plan: Homescape Construction

**Generated:** July 6, 2026
**Current Score:** 70/100
**Target Score:** 85/100

---

## Phase 1: Critical Fixes (This Week)

These issues are actively preventing indexing or causing significant SEO harm.

### 1.1 Fix Canonical Tags on All Pages

**Priority:** CRITICAL
**Effort:** 1-2 hours
**Impact:** Enables proper indexing of all pages

**Problem:** All pages have `<link rel="canonical" href="https://homescapeconstruction.com"/>` pointing to homepage.

**Files to modify:**

| File                        | Canonical URL                                             |
| --------------------------- | --------------------------------------------------------- |
| `app/page.tsx`              | `https://homescapeconstruction.com`                       |
| `app/projects/page.tsx`     | `https://homescapeconstruction.com/projects`              |
| `app/about/page.tsx`        | `https://homescapeconstruction.com/about`                 |
| `app/contact/page.tsx`      | `https://homescapeconstruction.com/contact`               |
| `app/testimonials/page.tsx` | `https://homescapeconstruction.com/testimonials`          |
| `app/blog/page.tsx`         | `https://homescapeconstruction.com/blog`                  |
| `app/blog/[slug]/page.tsx`  | Dynamic: `https://homescapeconstruction.com/blog/${slug}` |

**Implementation:**

```typescript
// Example for app/projects/page.tsx
export const metadata: Metadata = {
  // ... existing metadata
  alternates: {
    canonical: "https://homescapeconstruction.com/projects",
  },
};
```

For dynamic routes (blog posts):

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    // ... existing metadata
    alternates: {
      canonical: `https://homescapeconstruction.com/blog/${params.slug}`,
    },
  };
}
```

---

### 1.2 Create OG Image

**Priority:** CRITICAL
**Effort:** 30 minutes
**Impact:** Social shares display image preview

**Options:**

**Option A (Quick):** Add static image

1. Create 1200x630px image with Homescape branding
2. Save as `public/og-image.jpg`

**Option B (Better):** Use Next.js OG Image generation

1. Create `app/opengraph-image.tsx` for dynamic generation

---

### 1.3 Fix Blog Title Duplication

**Priority:** HIGH
**Effort:** 15 minutes
**Impact:** Professional SERP appearance

**File:** `app/blog/page.tsx`

**Change:**

```typescript
// Before
title: "Blog | Homescape Construction | Homescape Construction";

// After
title: "Blog | Homescape Construction";
```

Or use title template in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: "Homescape Construction | Chicago Home Builder",
    template: "%s | Homescape Construction",
  },
};
```

---

### 1.4 Add Security Headers

**Priority:** HIGH
**Effort:** 30 minutes
**Impact:** Security posture, trust signals

**File:** `vercel.json` (create if doesn't exist)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## Phase 2: Performance & Schema (Week 2)

### 2.1 Fix LCP - Preload Hero Image

**Priority:** HIGH
**Effort:** 1 hour
**Impact:** LCP from 3.5s to <2.5s

**Option A:** Add preload hint in `app/layout.tsx`:

```tsx
<link
  rel="preload"
  as="image"
  href="https://cdn.sanity.io/images/2omgdk67/production/[hero-image-id].jpg?w=1920&q=80&auto=format"
  fetchPriority="high"
/>
```

**Option B (Better):** Convert `components/Hero.tsx` from CSS background-image to Next.js Image:

```tsx
import Image from "next/image";

<div className="hero-bg">
  <Image
    src={heroImageUrl}
    alt="Chicago home renovation by Homescape Construction"
    fill
    priority
    sizes="100vw"
    style={{ objectFit: "cover" }}
  />
</div>;
```

---

### 2.2 Add Preconnect Hints

**Priority:** MEDIUM
**Effort:** 10 minutes
**Impact:** Faster image loading

**File:** `app/layout.tsx`

```tsx
<head>
  <link rel="preconnect" href="https://cdn.sanity.io" />
  <link rel="dns-prefetch" href="https://cdn.sanity.io" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
</head>
```

---

### 2.3 Add WebSite Schema

**Priority:** MEDIUM
**Effort:** 30 minutes
**Impact:** Sitelinks searchbox eligibility

**File:** `app/layout.tsx`

```tsx
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://homescapeconstruction.com/#website",
  url: "https://homescapeconstruction.com",
  name: "Homescape Construction",
  description: "Chicago home builder and remodeling contractor since 2012",
  publisher: {
    "@id": "https://homescapeconstruction.com/#organization",
  },
};
```

---

### 2.4 Add BreadcrumbList Schema to Blog Posts

**Priority:** MEDIUM
**Effort:** 45 minutes
**Impact:** Breadcrumb rich results

**File:** `app/blog/[slug]/page.tsx`

```tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://homescapeconstruction.com" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: "https://homescapeconstruction.com/blog",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `https://homescapeconstruction.com/blog/${post.slug}`,
    },
  ],
};
```

---

### 2.5 Enhance Article Schema

**Priority:** MEDIUM
**Effort:** 30 minutes
**Impact:** Article rich result eligibility

**File:** `app/blog/[slug]/page.tsx`

Add missing properties:

```typescript
const articleSchema = {
  // ... existing properties
  dateModified: post.updatedAt || post.publishedAt,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://homescapeconstruction.com/blog/${post.slug}`,
  },
  publisher: {
    "@type": "Organization",
    name: "Homescape Construction Inc.",
    logo: {
      "@type": "ImageObject",
      url: "https://homescapeconstruction.com/logo.png",
    },
  },
};
```

---

## Phase 3: Content Expansion (Weeks 2-4)

### 3.1 Expand Core Pages

**Priority:** HIGH
**Effort:** 8-12 hours total
**Impact:** Dramatically improves topical authority

| Page     | Current | Target | Content to Add                                     |
| -------- | ------- | ------ | -------------------------------------------------- |
| Homepage | 55      | 500+   | Service overview, value propositions, social proof |
| About    | 128     | 500+   | Company history, team bios, credentials            |
| Projects | 60      | 500+   | Portfolio categories, process overview             |
| Contact  | 63      | 300+   | Service areas, business hours, FAQ                 |

---

### 3.2 Create Service Landing Pages

**Priority:** HIGH
**Effort:** 4-6 hours per page
**Impact:** Captures service-specific search traffic

Create 7 pages (800+ words each):

1. `/services/kitchen-remodeling`
2. `/services/bathroom-remodeling`
3. `/services/custom-homes`
4. `/services/basement-finishing`
5. `/services/adu-construction`
6. `/services/whole-home-renovation`
7. `/services/exterior-renovations`

**Template for each:**

- H1: Service name + Chicago
- Overview paragraph (150+ words)
- Process section with steps
- Cost range section
- Timeline expectations
- Chicago-specific considerations
- Related projects gallery
- CTA with lead form

---

### 3.3 Expand Blog Posts to 1,500+ Words

**Priority:** MEDIUM
**Effort:** 2-3 hours per post
**Impact:** Competitive for target keywords

For existing posts, add:

- Detailed cost breakdowns with tables
- Step-by-step process explanations
- Source citations (Chicago Dept. of Buildings, HomeAdvisor, etc.)
- Before/after project examples
- FAQ sections

---

## Phase 4: Trust & Authority (Ongoing)

### 4.1 Add License/Insurance to Footer

**Priority:** HIGH
**Effort:** 30 minutes
**Impact:** Critical E-E-A-T signal

**File:** `components/Footer.tsx`

Add: "Licensed General Contractor | Fully Insured & Bonded"

---

### 4.2 Fix Founding Date Inconsistency

**Priority:** HIGH
**Effort:** 1 hour
**Impact:** Prevents AI citation conflicts

Files to align:

- `public/llms.txt` - line 5
- `app/layout.tsx` - schema foundingDate
- `components/Footer.tsx` - "since XXXX"
- About page content

---

### 4.3 Add Privacy Policy

**Priority:** MEDIUM
**Effort:** 1 hour
**Impact:** Trust signal, legal compliance

Create `app/privacy/page.tsx` with standard privacy policy content.

---

### 4.4 Create Author Bio Page

**Priority:** MEDIUM
**Effort:** 2 hours
**Impact:** Strengthens blog E-E-A-T

Create `/about/team` or `/about/dave-adams` with:

- Professional credentials
- Years in industry
- Notable projects
- LinkedIn link
- Certifications

Link from all blog post bylines.

---

### 4.5 Manage Remaining AI Crawlers

**Priority:** LOW
**Effort:** 15 minutes
**Impact:** Complete AI crawler policy

**File:** `app/robots.ts`

Add explicit rules for:

```typescript
{ userAgent: 'Google-Extended', disallow: '/' },
{ userAgent: 'Applebot-Extended', disallow: '/' },
{ userAgent: 'Bytespider', disallow: '/' },
{ userAgent: 'FacebookBot', disallow: '/' },
{ userAgent: 'Amazonbot', disallow: '/' },
```

---

## Implementation Checklist

### Week 1 (Critical)

- [ ] Fix canonical tags on all 7+ pages
- [ ] Create og-image.jpg
- [ ] Fix blog title duplication
- [ ] Add security headers to vercel.json

### Week 2 (Performance & Schema)

- [ ] Preload hero image / convert to Next.js Image
- [ ] Add preconnect hints
- [ ] Add WebSite schema
- [ ] Add BreadcrumbList to blog posts
- [ ] Enhance Article schema with dateModified, publisher.logo

### Weeks 2-4 (Content)

- [ ] Expand homepage to 500+ words
- [ ] Expand about page to 500+ words
- [ ] Create first 3 service landing pages
- [ ] Expand existing blog posts to 1,500+ words

### Ongoing (Authority)

- [ ] Add license/insurance to footer
- [ ] Fix founding date everywhere
- [ ] Create privacy policy
- [ ] Create author bio page
- [ ] Add remaining AI crawler rules

---

## Expected Results

After completing Phases 1-2:

- **SEO Score:** 70 → 80
- **LCP:** 3.5s → <2.5s
- **Proper indexing** of all inner pages

After completing Phases 3-4:

- **SEO Score:** 80 → 85+
- **E-E-A-T Score:** 61 → 75+
- **GEO Score:** 62 → 75+
- **Competitive for local service keywords**
