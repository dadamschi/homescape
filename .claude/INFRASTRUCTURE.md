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
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Blog generation (Claude API) |
| `SANITY_WRITE_TOKEN` | `sk...` | Blog generation (Sanity mutations) |
| `CRON_SECRET` | Random string | Authenticate cron requests |

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

#### `blogPost`
| Field | Type | Notes |
|---|---|---|
| `title` | string | Required |
| `slug` | slug | Auto-generated from title |
| `publishedAt` | datetime | Required for post to appear on site |
| `excerpt` | text | Summary for listings and SEO |
| `body` | array of blocks | Portable Text content |
| `category` | string | Chicago Trends / Seasonal Tips / Industry News / Home Improvement |
| `dataSources` | string[] | Sources used for AI generation |
| `generatedAt` | datetime | When AI generated the draft |

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
  └── lib/sanity.ts (sanityClient, sanityFetch, sanityWriteClient)
        └── Server Components fetch directly
              ├── app/layout.tsx (siteSettings)
              ├── app/page.tsx (heroContent)
              ├── app/projects/page.tsx (projects)
              ├── app/about/page.tsx (aboutContent, heroContent fallback)
              ├── app/testimonials/page.tsx (testimonials)
              ├── app/contact/page.tsx (locations, siteSettings)
              ├── app/blog/page.tsx (blogPosts)
              └── app/blog/[slug]/page.tsx (blogPost by slug)
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

## Automated Blog Generation

AI-powered blog post generation using Chicago data sources.

### Architecture

```
GitHub Actions Cron (Sunday 9am Chicago)
    ↓
POST /api/generate-blog
    ↓
┌─────────────────────────────────────┐
│  Fetch Chicago Data                 │
│  • City of Chicago Data Portal      │
│  •   (building permits)             │
│  • OpenWeatherMap (optional)        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Claude API (Anthropic)             │
│  • Generates 2-3 focused posts      │
│  • Each 200-350 words               │
│  • Different topics/categories      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Sanity CMS                         │
│  • Creates draft blog posts         │
│  • Sets publishedAt automatically   │
│  • Human reviews in Studio          │
└─────────────────────────────────────┘
    ↓
/blog (listing) + /blog/[slug] (posts)
```

### GitHub Actions Cron

**File:** `.github/workflows/generate-blog.yml`
**Schedule:** Every Sunday at 9am Chicago time (`0 15 * * 0` UTC)
**Manual trigger:** Available via Actions tab

**Required GitHub Secrets:**

| Secret | Value |
|--------|-------|
| `CRON_SECRET` | Same as Vercel env var |
| `SITE_URL` | `https://homescapeconstruction.com` |

### Data Sources

| Source | API | Data |
|--------|-----|------|
| Chicago Data Portal | `data.cityofchicago.org` | Recent building permits |
| OpenWeatherMap | `api.openweathermap.org` | Current weather (optional) |

### Blog Categories

- **Chicago Trends** — Permit activity, neighborhood development
- **Seasonal Tips** — Weather-related construction advice
- **Industry News** — Local construction news and updates
- **Home Improvement** — Practical homeowner advice

### Local Testing

```bash
# Generate posts locally
curl -X POST http://localhost:3000/api/generate-blog

# Check Sanity Studio for drafts
cd studio && npm run dev   # http://localhost:3333
```

### Key Files

| File | Purpose |
|------|---------|
| `app/api/generate-blog/route.ts` | Generation API endpoint |
| `app/blog/page.tsx` | Blog listing page |
| `app/blog/[slug]/page.tsx` | Individual post page |
| `components/BlogCard.tsx` | Post card component |
| `studio/schemas/blogPost.js` | Sanity schema |
| `.github/workflows/generate-blog.yml` | Cron schedule |

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
- [x] Verify domain in Resend (DNS records added to Cloudflare)
- [x] Add `RESEND_API_KEY` to Vercel environment variables
- [x] Deploy Sanity Studio
- [x] Add automated blog generation system
- [x] Add blog pages (`/blog`, `/blog/[slug]`)
- [x] Set up GitHub Actions cron for weekly blog generation

## Pending Tasks

- [ ] Configure Gmail "Send As" for `info@homescapeconstruction.com`
- [ ] Set up Sanity webhook for on-demand revalidation
- [ ] Add `REVALIDATION_SECRET` to Vercel env vars
- [ ] Add `ANTHROPIC_API_KEY` to Vercel env vars
- [ ] Add `SANITY_WRITE_TOKEN` to Vercel env vars
- [ ] Add `CRON_SECRET` to Vercel env vars + GitHub Secrets
- [ ] Add `SITE_URL` to GitHub Secrets

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
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=2omgdk67
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=sk...     # Get from sanity.io → Manage → API → Tokens (Editor role)

# Email
RESEND_API_KEY=re_xxxxx      # Get from resend.com

# Blog generation
ANTHROPIC_API_KEY=sk-ant-... # Get from console.anthropic.com
OPENWEATHER_API_KEY=         # Optional, for weather data

# Security
REVALIDATION_SECRET=         # Optional, for Sanity webhook auth
CRON_SECRET=                 # For GitHub Actions cron auth
```