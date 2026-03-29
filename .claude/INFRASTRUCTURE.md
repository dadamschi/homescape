# Homescape Construction — Infrastructure Reference

Last updated: March 2026

---

## Overview

| Layer | Service | Account |
|---|---|---|
| Frontend | Vercel | Homescape Construction team |
| CMS | Sanity.io | dadams.chi@gmail.com |
| DNS | Cloudflare | Active |
| Domain Registrar | GoDaddy | Client |
| Email (inbound) | Cloudflare Routing → Gmail | daveporter66@gmail.com |
| Email (transactional) | Resend | Contact form notifications |
| Source Control | GitHub | dadamschi/homescape |

---

## Domain

**Domain:** `homescapeconstruction.com`
**Registrar:** GoDaddy (nameservers delegated to Cloudflare)

### DNS — Cloudflare (ACTIVE)

DNS is managed entirely in Cloudflare. GoDaddy's DNS editor is bypassed.

**Nameservers (at GoDaddy):**
```
ivy.ns.cloudflare.com
margo.ns.cloudflare.com
```

**Current A/CNAME records (pointing to Vercel):**

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |

**MX records (email routing):**

| Type | Name | Content | Priority |
|---|---|---|---|
| MX | `@` | `route1.mx.cloudflare.net` | 20 |
| MX | `@` | `route2.mx.cloudflare.net` | 43 |
| MX | `@` | `route3.mx.cloudflare.net` | 36 |

---

## Hosting — Vercel

**Team:** Homescape Construction (`homescape-construction`)
**Project:** `homescape`
**GitHub:** `dadamschi/homescape` (auto-deploys on push to `main`)
**Production URL:** `homescapeconstruction.com`
**Framework:** Next.js 15 (App Router)

### Environment Variables

| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `2omgdk67` | Sanity CMS |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Sanity CMS |
| `RESEND_API_KEY` | `re_...` | Contact form email |
| `REVALIDATION_SECRET` | *(optional)* | On-demand cache busting |

### vercel.json

```json
{
  "framework": "nextjs"
}
```

### On-Demand Revalidation

To bust cache when publishing content in Sanity:
1. Create a webhook in Sanity → API → Webhooks
2. URL: `https://homescapeconstruction.com/api/revalidate?secret=YOUR_SECRET`
3. Trigger on: Create, Update, Delete

---

## CMS — Sanity.io

**Project ID:** `2omgdk67`
**Organization:** Homescape (`os9Tptow7`)
**Dataset:** `production`
**Account:** `dadams.chi@gmail.com`
**Studio host:** `homescapeconstruction.sanity.studio`
**Studio path:** `/Users/dadamsgs/work/homescape/studio/`

### CORS origins configured

| Origin | Purpose |
|---|---|
| `http://localhost:3000` | Local Next.js dev server |
| `https://*.sanity.studio` | Sanity Studio |
| `https://*.vercel.app` | Vercel preview deploys |
| `https://homescapeconstruction.com` | Production |

### Content model

#### `project`
| Field | Type | Notes |
|---|---|---|
| `title` | string | Required |
| `category` | string | Residential / Commercial / Renovation |
| `description` | text | |
| `image` | image | Main image with alt, caption, photoCredit |
| `imageUrl` | url | Fallback for external URLs |
| `images` | image[] | Gallery (max 20), each with alt, caption, photoCredit |
| `year` | string | |
| `location` | string | City, State |

#### `testimonial`
| Field | Type |
|---|---|
| `name` | string |
| `project` | string |
| `quote` | text |
| `rating` | number (1–5) |

#### `location`
| Field | Type |
|---|---|
| `name` | string |
| `address` | string |
| `phone` | string |
| `hours` | string |

#### `siteSettings`
| Field | Type |
|---|---|
| `companyName` | string |
| `tagline` | string |
| `phone` | string |
| `email` | string |
| `social.facebook` | url |
| `social.instagram` | url |
| `social.linkedin` | url |

#### `aboutContent`
| Field | Type |
|---|---|
| `headline` | string |
| `story` | text |
| `image` | image |
| `values` | array of `{ title, description }` |
| `stats` | array of `{ label, value }` |

#### `heroContent`
| Field | Type |
|---|---|
| `headline` | string |
| `story` | text |
| `heroImages` | image[] |

### Studio deploy

```bash
cd /Users/dadamsgs/work/homescape/studio
npx sanity@latest schema deploy  # Deploy schema changes
npx sanity deploy                # Deploy Studio UI
```

---

## Data flow

Data is fetched server-side in Next.js page components using `sanityFetch()`.

```
Sanity API
  └── lib/sanity.ts (sanityClient, sanityFetch)
        └── Server Components fetch directly
              ├── app/layout.tsx (siteSettings)
              ├── app/page.tsx (heroContent)
              ├── app/projects/page.tsx (projects)
              ├── app/about/page.tsx (aboutContent, heroContent fallback)
              ├── app/testimonials/page.tsx (testimonials)
              └── app/contact/page.tsx (locations, siteSettings)
```

**Sanity client config:** `lib/sanity.ts`

```ts
createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2025-02-06',
})
```

---

## Email

### Inbound — Cloudflare Routing

**Routing:** `*@homescapeconstruction.com` → `daveporter66@gmail.com`

Handles emails sent directly to info@homescapeconstruction.com.

See `EMAIL_AND_DOMAIN.md` for full configuration details.

### Outbound — Resend (transactional)

**Service:** Resend (resend.com)
**Purpose:** Send contact form submission notifications
**From address:** `noreply@homescapeconstruction.com`
**To address:** `info@homescapeconstruction.com`

Contact form submissions POST to `/api/lead`, which uses Resend to email the lead details to info@homescapeconstruction.com (then routed to Gmail via Cloudflare).

---

## Lead Capture Flow

```
User submits contact form
    ↓
POST /api/lead
    ↓
Resend API sends email
    ↓
Email to info@homescapeconstruction.com
    ↓
Cloudflare routes to daveporter66@gmail.com
    ↓
Lead arrives in Gmail
```

---

## Completed Tasks

- [x] Migrate from Vite SPA to Next.js 15 SSR
- [x] Update Cloudflare DNS to point to Vercel
- [x] Configure vercel.json for Next.js
- [x] Add JSON-LD structured data (LocalBusiness schema)
- [x] Add robots.txt with AI crawler permissions
- [x] Add llms.txt for LLM content guidance
- [x] Add XML sitemap generation
- [x] Add on-demand revalidation API route
- [x] Add photoCredit field to project images
- [x] Set up Resend for contact form emails
- [x] Add favicon (H with roof peak)

## Pending Tasks

- [ ] Deploy Sanity Studio (`npx sanity deploy` from `/studio`)
- [ ] Configure Gmail "Send As" for `info@homescapeconstruction.com`
- [ ] Set up Sanity webhook for on-demand revalidation
- [ ] Add `REVALIDATION_SECRET` to Vercel env vars

## Recently Completed

- [x] Verify domain in Resend (DNS records added to Cloudflare)
- [x] Add `RESEND_API_KEY` to Vercel environment variables

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev          # http://localhost:3000

# Build for production
npm run build

# Run tests
npm test

# Sanity Studio (separate)
cd studio && npm run dev   # http://localhost:3333
```

**Required `.env.local` at project root:**

```
NEXT_PUBLIC_SANITY_PROJECT_ID=2omgdk67
NEXT_PUBLIC_SANITY_DATASET=production
RESEND_API_KEY=re_xxxxx      # Get from resend.com
REVALIDATION_SECRET=         # Optional, for webhook auth
```