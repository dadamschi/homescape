# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js development server
npm run build    # Production build to .next/
npm run start    # Start production server
npm test         # Run tests with Vitest
```

## Architecture

This is a Next.js 15 marketing site for Homescape Construction with server-side rendering (SSR) for SEO/GEO optimization.

### Routing & Pages
- **Next.js App Router** — pages in `app/` directory
- **Server Components** — fetch data server-side for SSR
- **Client Components** — use `"use client"` directive for interactivity

### Page Structure
```
app/
├── layout.tsx              # Root layout (Nav, Footer, QuickContact)
├── page.tsx                # Home (Hero)
├── projects/page.tsx       # Projects portfolio
├── about/page.tsx          # Company info
├── testimonials/page.tsx
├── contact/page.tsx        # Lead capture form
├── blog/page.tsx           # Blog listing
├── blog/[slug]/page.tsx    # Individual blog posts
├── api/lead/route.ts       # Lead submission → Resend email
├── api/revalidate/route.ts # On-demand cache busting
├── api/generate-blog/route.ts  # AI blog generation (cron)
├── sitemap.ts              # Dynamic XML sitemap
├── robots.ts               # robots.txt generation
├── icon.svg                # Favicon
└── apple-icon.svg          # Apple touch icon
```

### Data Layer
- **Sanity CMS** — content fetched server-side via `lib/sanity.ts`
- **GROQ queries** — defined in `lib/queries.ts`
- **Zustand** — client state (theme, menu) in `lib/store.ts`
- **Lead API** — `/api/lead` sends email via Resend

### Key Files
- `lib/sanity.ts` — Sanity client + urlFor helper
- `lib/queries.ts` — GROQ queries for all content types
- `lib/types.ts` — TypeScript interfaces for Sanity data
- `lib/store.ts` — Zustand store for UI state
- `app/layout.tsx` — Root layout with JSON-LD schema

### Components
All components in `components/`:
- `Hero.tsx` — Landing hero section (server component)
- `ProjectsGrid.tsx` — Project portfolio with photo credits (client component)
- `ImageCarousel.tsx` — Image carousel with photo credits (client component)
- `ContactForm.tsx` — Lead capture form (client component)
- `BlogCard.tsx` — Blog post card (client component)
- `Nav.tsx`, `Footer.tsx` — Layout components
- `QuickContact.tsx` — Floating contact drawer
- `ThemeSwitch.tsx` — Theme toggle
- `ThemeProvider.tsx` — Theme hydration

### Automated Blog Generation
- **Cron:** GitHub Actions runs weekly (Sunday 9am Chicago)
- **API:** `/api/generate-blog` fetches Chicago data + Claude generates posts
- **Data sources:** Chicago Data Portal (permits), OpenWeatherMap
- **Output:** 2-3 focused posts per week, created as Sanity drafts

## Environment Variables

Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=2omgdk67
NEXT_PUBLIC_SANITY_DATASET=production
RESEND_API_KEY=re_xxxxx
```

## SEO/GEO Features

- **Server-side rendering** — full HTML for AI crawlers
- **JSON-LD schema** — LocalBusiness structured data in layout
- **Dynamic metadata** — per-page titles and descriptions
- **XML sitemap** — auto-generated at `/sitemap.xml`
- **robots.txt** — AI crawler permissions at `/robots.txt`
- **llms.txt** — LLM content guide in `public/llms.txt`

## Code Style

- **Never use `any` type** — look up and use proper types
- **Throw errors early** — no fallbacks, we are in pre-production
- **Breaking changes OK** — pre-production, avoid defensive fallbacks