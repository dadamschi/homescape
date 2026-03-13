# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

## Architecture

This is a React 19 SPA for Homescape Construction, a marketing site with lead capture functionality.

### Routing & State
- **Hash-based routing** in `App.jsx` — pages map to URL hashes (`#home`, `#projects`, `#about`, `#testimonials`, `#contact`)
- **Zustand store** (`src/store.jsx`) — manages `currentPage`, `menuOpen`, and lead form state
- Navigation via `navigate(page)` exported from store

### Data Layer
- **Mock data** in `src/data.jsx` — mirrors Sanity GROQ query shapes
- **Sanity client** in `sanity.js` — ready to swap mock data for live CMS content
- **Lead capture** in `src/leads.js` — submits to Google Sheets via Apps Script

### Key Files
- `src/App.jsx` — Router component and page mapping
- `src/store.jsx` — Zustand store with navigation helper
- `src/data.jsx` — CMS_DATA mock (projects, testimonials, locations, siteSettings, aboutContent)
- `sanity.js` — Sanity client config and GROQ queries
- `src/leads.js` — Google Sheets lead submission

### Components
All page components in `src/components/`:
- `Hero.jsx` — Landing hero section
- `ProjectsPage.jsx` — Project portfolio grid
- `Aboutpage.jsx` — Company story and values
- `TestimonialsPage.jsx` — Client testimonials
- `Contactpage.jsx` — Lead capture form with locations
- `Nav.jsx`, `Footer.jsx` — Shared layout components
- `Icons.jsx` — SVG icon components

## Environment Variables

Copy `.env.example` to `.env`:
```
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Code Style

- **Never use `any` type** — look up and use proper types
- **Throw errors early** — no fallbacks, we are in pre-production
- **Breaking changes OK** — pre-production, avoid defensive fallbacks