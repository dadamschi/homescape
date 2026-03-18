# Homescape Construction — Infrastructure Reference

Last updated: March 2026

---

## Overview

| Layer | Service | Account |
|---|---|---|
| Frontend | Vercel | Homescape Construction team |
| CMS | Sanity.io | dadams.chi@gmail.com |
| DNS | Cloudflare | TBD (pending nameserver transfer) |
| Domain Registrar | HostMonster | Client |
| Email (planned) | Cloudflare Routing + Gmail Send As | Client Gmail |
| Source Control | GitHub | dadamschi/homescape |

---

## Domain

**Domain:** `homescapeconstruction.com`
**Registrar:** HostMonster

### DNS — Cloudflare (PENDING activation)

Cloudflare has imported the existing DNS records. To activate, update nameservers at HostMonster to:

```
ivy.ns.cloudflare.com
margo.ns.cloudflare.com
```

**Current A records (imported from HostMonster):**

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `*` | `74.220.199.6` | Proxied |
| A | `homescapeconstruction.com` | `74.220.199.6` | Proxied |
| A | `www` | `74.220.199.6` | Proxied |

**Required update after Cloudflare activates:** Change root A record and `www` to point at Vercel:

| Type | Name | Content |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

---

## Hosting — Vercel

**Team:** Homescape Construction (`homescape-construction`)
**Project:** `homescape`
**GitHub:** `dadamschi/homescape` (auto-deploys on push to `main`)
**Production URL:** `homescapeconstruction.com` (pending DNS activation)

### Environment Variables

| Variable | Value |
|---|---|
| `VITE_SANITY_PROJECT_ID` | `2omgdk67` |
| `VITE_SANITY_DATASET` | `production` |
| `VITE_GOOGLE_SHEETS_URL` | *(pending — Google Apps Script deploy)* |

### Deploy commands

```bash
# Link local repo to Vercel project
vercel link --scope homescape-construction

# Deploy to production
vercel --prod

# Add domain
vercel domains add homescapeconstruction.com --scope homescape-construction
```

### SPA routing

`vercel.json` contains a rewrite rule to support client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## CMS — Sanity.io

**Project ID:** `2omgdk67`
**Organization:** Homescape (`os9Tptow7`)
**Dataset:** `production`
**Account:** `dadams.chi@gmail.com`
**Studio host:** `homescapeconstruction.sanity.studio` *(pending deploy)*
**Studio path:** `/Users/dadamsgs/work/homescape/studio/`

### CORS origins configured

| Origin | Purpose |
|---|---|
| `http://localhost:5173` | Local Vite dev server |
| `https://*.sanity.studio` | Sanity Studio |
| `https://*.vercel.app` | Vercel preview deploys |
| `https://homescapeconstruction.com` | Production *(add after DNS is live)* |

### Content model

#### `project`
| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `category` | string | Residential / Commercial / Renovation |
| `description` | text | |
| `image` | image | Sanity-hosted upload |
| `imageUrl` | url | Fallback for external URLs |
| `images` | image[] | Gallery, max 20 |
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
| `imageUrl` | url (fallback) |
| `values` | array of `{ title, description }` |
| `stats` | array of `{ label, value }` |

### GROQ query patterns

```groq
// Projects
*[_type == "project"] | order(year desc) {
  _id, title, category, description, year, location,
  "image": select(defined(image.asset) => image.asset->url, imageUrl),
  "images": images[].asset->url
}

// Testimonials
*[_type == "testimonial"] { _id, name, project, quote, rating }

// Locations
*[_type == "location"] { _id, name, address, phone, hours }

// Site settings
*[_type == "siteSettings"][0] { companyName, tagline, phone, email, social }

// About content
*[_type == "aboutContent"][0] {
  headline, story, values, stats,
  "image": select(defined(image.asset) => image.asset->url, imageUrl)
}
```

### Studio deploy

```bash
cd /Users/dadamsgs/work/homescape/studio
npm run build
npx sanity deploy
# Studio host: homescapeconstruction
```

---

## Data flow

All CMS data is fetched in `src/data.jsx` via a `CMSProvider` React context using `Promise.allSettled`. Components access data via the `useCMS()` hook.

```
Sanity API
  └── src/data.jsx (CMSProvider, Promise.allSettled)
        └── useCMS() hook
              ├── Nav (siteSettings)
              ├── Hero (siteSettings)
              ├── ProjectsPage (projects)
              ├── AboutPage (aboutContent)
              ├── TestimonialsPage (testimonials)
              ├── ContactPage (locations, siteSettings)
              └── Footer (siteSettings)
```

**Sanity client config:** `sanity.js` at project root

```js
createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-01',
})
```

---

## Email — Lead capture

**Script:** `/Users/dadamsgs/work/homescape/homescape-lead-capture.gs`

Contact form submissions POST to a Google Apps Script web app, which emails leads to `info@homescapeconstruction.com`.

### Setup steps (pending)

1. Go to [script.google.com](https://script.google.com) → New project → paste `homescape-lead-capture.gs`
2. Run `testEmail` to authorize Gmail permissions
3. Deploy → New Deployment → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the web app URL
5. Add to Vercel: `vercel env add VITE_GOOGLE_SHEETS_URL`
6. Redeploy: `vercel --prod`

### Professional email — options

| Option | Cost | Notes |
|---|---|---|
| **Cloudflare Routing + Gmail Send As** | Free | Receive at `info@`, reply from Gmail. Some clients show "sent on behalf of". |
| **Google Workspace** | $6/mo | Full professional email. Recommended for client handoff. Domain can live here too. |

**Cloudflare Email Routing setup** (if going free route):
1. Cloudflare dashboard → Email → Email Routing → Enable
2. Add route: `info` → client's personal Gmail
3. In Gmail → Settings → Accounts → Send mail as → Add `info@homescapeconstruction.com`
4. SMTP: `smtp.gmail.com`, port `587`, with Gmail App Password

---

## Pending tasks

- [ ] Update HostMonster nameservers to `ivy.ns.cloudflare.com` / `margo.ns.cloudflare.com`
- [ ] Update Cloudflare A records to point at Vercel (`76.76.21.21`)
- [ ] Add `https://homescapeconstruction.com` to Sanity CORS origins
- [ ] Deploy Sanity Studio (`npx sanity deploy` from `/studio`)
- [ ] Patch 6 project documents — migrate `imageUrl` field (see below)
- [ ] Set up Google Apps Script lead capture + add `VITE_GOOGLE_SHEETS_URL` env var
- [ ] Decide on email solution (Cloudflare free vs Google Workspace $6/mo)
- [ ] Update `siteSettings` email in Sanity once `info@homescapeconstruction.com` is live
- [ ] Redeploy to Vercel after above changes: `git push` → auto-deploy

### Project image migration (after Studio deploy)

Six project documents need their Unsplash URLs moved to the `imageUrl` field:

| Document ID | Image URL |
|---|---|
| `36892525` | `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80` |
| `442f8d5d` | `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80` |
| `55164b28` | `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80` |
| `5d3e969b` | `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80` |
| `b5aa6d1f` | `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80` |
| `d784e13c` | `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80` |

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev          # http://localhost:5173

# Build for production
npm run build

# Sanity Studio (separate)
cd studio && npm run dev   # http://localhost:3333
```

**Required `.env` at project root:**

```
VITE_SANITY_PROJECT_ID=2omgdk67
VITE_SANITY_DATASET=production
VITE_GOOGLE_SHEETS_URL=         # add after Apps Script deploy
```
