# SEO & GEO Audit Report: Homescape Construction

**URL:** https://homescapeconstruction.com
**Audit Date:** July 6, 2026
**Business Type:** Local Construction Contractor (Chicago, IL)
**Framework:** Next.js 15 (SSR) on Vercel

---

## Executive Summary

| Category                     | Score  | Weight | Weighted   |
| ---------------------------- | ------ | ------ | ---------- |
| Technical SEO                | 68/100 | 25%    | 17.0       |
| Content Quality              | 58/100 | 20%    | 11.6       |
| On-Page SEO                  | 65/100 | 15%    | 9.75       |
| Schema/Structured Data       | 80/100 | 15%    | 12.0       |
| Performance (CWV)            | 84/100 | 10%    | 8.4        |
| Images                       | 85/100 | 10%    | 8.5        |
| AI Search Readiness (GEO)    | 62/100 | 5%     | 3.1        |
| **Overall SEO Health Score** |        |        | **70/100** |

### Rating: Needs Improvement

The site has strong technical foundations (SSR, valid sitemap, comprehensive LocalBusiness schema) but is undermined by **two critical issues** that must be fixed immediately:

1. **All canonical tags point to the homepage** - prevents indexing of inner pages
2. **All pages have thin content** - 50-130 words vs 500+ minimum

---

## Critical Issues (Fix Immediately)

### 1. Canonical Tags Misconfigured

**Severity:** 🔴 Critical
**Impact:** Google treats all pages as duplicates of homepage, preventing organic visibility

**Evidence:**

```html
<!-- /projects page -->
<link rel="canonical" href="https://homescapeconstruction.com" />
<!-- /about page -->
<link rel="canonical" href="https://homescapeconstruction.com" />
<!-- /blog/chicago-zoning-for-adus -->
<link rel="canonical" href="https://homescapeconstruction.com" />
```

**Fix:** Update metadata exports in each page to include page-specific canonicals:

```typescript
// app/projects/page.tsx
export const metadata = {
  alternates: {
    canonical: "https://homescapeconstruction.com/projects",
  },
};
```

**Files:** All `app/*/page.tsx` files

---

### 2. OG Image Returns 404

**Severity:** 🔴 Critical
**Impact:** Social shares display no image preview, reducing CTR

**Evidence:**

```bash
curl -sI https://homescapeconstruction.com/og-image.jpg
# HTTP/2 404
```

**Fix:** Add `og-image.jpg` (1200x630px) to `public/og-image.jpg` or use Next.js OG Image generation.

---

### 3. Thin Content Across All Pages

**Severity:** 🔴 Critical
**Impact:** Insufficient topical depth for competitive local search queries

| Page      | Actual Words | Minimum | Deficit |
| --------- | ------------ | ------- | ------- |
| Homepage  | 55           | 500     | -89%    |
| About     | 128          | 500     | -74%    |
| Projects  | 60           | 500     | -88%    |
| Contact   | 63           | 500     | -87%    |
| Blog Post | 377          | 1,500   | -75%    |

**Fix:** Expand all core pages to minimum word counts with substantive, original content.

---

## High Priority Issues

### 4. Missing Security Headers

**Severity:** ⚠️ High
**Score:** 45/100

| Header                  | Status  |
| ----------------------- | ------- |
| HSTS                    | Present |
| Content-Security-Policy | Missing |
| X-Frame-Options         | Missing |
| X-Content-Type-Options  | Missing |
| Referrer-Policy         | Missing |
| Permissions-Policy      | Missing |

**Fix:** Add headers via `vercel.json` or `middleware.ts`

---

### 5. LCP Above Threshold (3.5s)

**Severity:** ⚠️ High
**Target:** <2.5s

**Issue:** Hero background image is not preloaded and uses CSS `background-image` which cannot be discovered by the browser's preload scanner.

**Fix:**

1. Add `<link rel="preload">` for hero image
2. Convert from `background-image` to Next.js `<Image>` with `priority`

---

### 6. Missing License/Insurance Display

**Severity:** ⚠️ High
**Impact:** Critical trust signal for YMYL construction content

**Fix:** Add footer section: "Licensed General Contractor #XXX | Fully Insured | Bonded"

---

### 7. Blog Title Tag Duplication

**Severity:** ⚠️ High

**Evidence:**

```html
<title>Blog | Homescape Construction | Homescape Construction</title>
```

**Fix:** Update blog page metadata to remove duplication.

---

## Medium Priority Issues

### 8. Missing WebSite Schema

**Impact:** No sitelinks searchbox eligibility

**Fix:** Add WebSite schema with publisher reference to `app/layout.tsx`

---

### 9. Missing BreadcrumbList Schema

**Impact:** No breadcrumb rich results in SERPs

**Fix:** Add BreadcrumbList schema to blog posts and inner pages

---

### 10. Missing Article Schema Properties

**Impact:** Reduced Article rich result eligibility

**Missing:** `dateModified`, `mainEntityOfPage`, `publisher.logo`

---

### 11. Founding Date Inconsistency

**Impact:** AI systems may cite conflicting information

| Source   | Date        |
| -------- | ----------- |
| llms.txt | 2012        |
| Schema   | 2012        |
| Footer   | 1995        |
| About    | "30+ Years" |

**Fix:** Align all instances to accurate founding date.

---

### 12. Missing Preconnect Hints

**Impact:** Delayed image loading from Sanity CDN

**Fix:** Add to `app/layout.tsx`:

```html
<link rel="preconnect" href="https://cdn.sanity.io" />
```

---

### 13. No Service-Specific Landing Pages

**Impact:** Missing dedicated pages for key services

**Fix:** Create 7 service pages (800+ words each):

- `/services/kitchen-remodeling`
- `/services/bathroom-remodeling`
- `/services/custom-homes`
- `/services/basement-finishing`
- `/services/adu-construction`
- `/services/whole-home-renovation`
- `/services/exterior-renovations`

---

### 14. Blog Posts Missing Source Attribution

**Impact:** Reduced AI citation credibility

**Issue:** Statistics cited without sources (e.g., "$35,000-$75,000 kitchen remodel")

**Fix:** Add references to Chicago Department of Buildings, HomeAdvisor, NARI data

---

## Low Priority Issues

### 15. Unmanaged AI Crawlers

5 AI crawlers not explicitly managed in robots.txt:

- Google-Extended, Applebot-Extended, Bytespider, FacebookBot, Amazonbot

---

### 16. Missing Privacy Policy

Trust signal and legal requirement for lead capture forms.

---

### 17. Blog Posts Missing ISR

Aggressive no-cache headers on static blog content.

---

### 18. Limited ARIA Accessibility

Only 1 ARIA attribute detected across pages.

---

## What's Working Well

| Area                  | Status                                      |
| --------------------- | ------------------------------------------- |
| Server-Side Rendering | Full SSR via Next.js 15                     |
| HTTPS                 | HTTP/2, HSTS enabled                        |
| Sitemap               | Valid XML, 8 URLs, referenced in robots.txt |
| robots.txt            | Present, core AI crawlers allowed           |
| llms.txt              | Present with business context               |
| LocalBusiness Schema  | Comprehensive with 7 services, 29 areas     |
| Mobile Viewport       | Properly configured                         |
| Image Alt Text        | Present on all project images               |
| Image Lazy Loading    | Implemented for below-fold                  |
| CLS                   | 0.000 (Excellent)                           |
| INP/TBT               | 4ms (Excellent)                             |
| TTFB                  | 22ms (Excellent)                            |
| Broken Links          | 0 detected                                  |

---

## E-E-A-T Assessment

| Factor              | Score      | Issues                                  |
| ------------------- | ---------- | --------------------------------------- |
| Experience          | 55/100     | No case studies, limited project detail |
| Expertise           | 50/100     | No license display, no certifications   |
| Authoritativeness   | 65/100     | BBB/Houzz linked, no GBP link visible   |
| Trustworthiness     | 72/100     | Contact info present, no privacy policy |
| **Overall E-E-A-T** | **61/100** |                                         |

---

## AI Search Readiness (GEO)

| Dimension               | Score      |
| ----------------------- | ---------- |
| Technical Accessibility | 88/100     |
| Structural Readability  | 70/100     |
| Citability              | 55/100     |
| Authority/Brand Signals | 50/100     |
| Multi-Modal Content     | 45/100     |
| **Overall GEO Score**   | **62/100** |

### Platform-Specific Scores

| Platform            | Score  | Key Issue                  |
| ------------------- | ------ | -------------------------- |
| Google AI Overviews | 55/100 | Weak E-E-A-T signals       |
| ChatGPT/SearchGPT   | 60/100 | Low citability             |
| Perplexity          | 55/100 | Missing source attribution |
| Bing Copilot        | 70/100 | Strong local signals       |

---

## Files Requiring Changes

| File                        | Changes Needed                                   |
| --------------------------- | ------------------------------------------------ |
| `app/layout.tsx`            | Add preconnect, WebSite schema, fix foundingDate |
| `app/page.tsx`              | Add canonical, preload hero image                |
| `app/projects/page.tsx`     | Add canonical, expand content                    |
| `app/about/page.tsx`        | Add canonical, expand content, add team bios     |
| `app/contact/page.tsx`      | Add canonical                                    |
| `app/testimonials/page.tsx` | Add canonical, add Review schema                 |
| `app/blog/page.tsx`         | Fix title duplication, add canonical             |
| `app/blog/[slug]/page.tsx`  | Add BreadcrumbList, dateModified, publisher.logo |
| `app/robots.ts`             | Add explicit rules for 5 unmanaged AI crawlers   |
| `public/og-image.jpg`       | Create (1200x630px)                              |
| `public/llms.txt`           | Fix founding date                                |
| `vercel.json`               | Add security headers                             |
| `components/Hero.tsx`       | Convert to Next.js Image with priority           |
| `components/Footer.tsx`     | Add license/insurance, fix founding date         |
