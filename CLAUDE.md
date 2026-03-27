# Homescape Construction — CLAUDE.md

## Project overview

Lightweight marketing SPA for Homescape Construction, Inc. Built with React + Vite.
No backend — data comes from Sanity CMS. Lead capture posts to a Google Apps Script
web app that writes to Google Sheets. Deployed to Vercel.

## Tech stack

- **React 19** (functional components + hooks only, no class components)
- **Vite 7** — dev server and build
- **Zustand** — global state (`src/store.jsx`)
- **Sanity** — CMS client (`src/data.jsx`, `src/sanity.js`)
- **Plain CSS** — `src/styles.css` with CSS custom properties; no CSS-in-JS, no Tailwind
- **Google Apps Script** — lead capture (`src/leads.js` → `homescape-lead-capture.gs`)

## File map

```
src/
  App.jsx              # Root, routing, ThemeApplier
  store.jsx            # Zustand store — currentPage, theme, lead form state
  data.jsx             # CMSProvider + useCMS hook (Sanity)
  leads.js             # submitLead() — posts to Google Sheets
  styles.css           # All styles; two theme blocks: [data-theme="copper|green"]
  Icons.jsx            # SVG icon map
  components/
    Nav.jsx            # Fixed nav + mobile menu + ThemeSwitch
    ThemeSwitch.jsx    # Copper ↔ Green palette toggle (persisted to localStorage)
    Hero.jsx           # Home page hero
    ProjectsPage.jsx   # Filterable project gallery
    AboutPage.jsx      # About + stats
    TestimonialsPage.jsx
    ContactPage.jsx    # Full contact form
    QuickContact.jsx   # Slide-in drawer quote form — present on every page
    Footer.jsx
```

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

## Environment variables

```
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=
VITE_GOOGLE_SHEETS_URL=   # optional — leads log to console if absent
```

---

## Testing

### Setup

This project uses **Vitest** + **React Testing Library**. Install once:

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add to `vite.config.js`:

```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.js"],
},
```

Create `src/test/setup.js`:

```js
import "@testing-library/jest-dom";
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

### Where tests live

```
src/
  components/
    Nav.test.jsx
    ThemeSwitch.test.jsx
    QuickContact.test.jsx
    ContactPage.test.jsx
    Hero.test.jsx
  leads.test.js
  store.test.js
```

### Conventions Claude must follow when writing tests

1. **Always use React Testing Library** — query by role, label, or text. Never query by class name or CSS selector.
2. **Mock Sanity / CMS** — wrap components that call `useCMS()` with a `<CMSProvider>` mock or mock the `../data` module directly.
3. **Mock `submitLead`** — always mock `../leads` in form tests; never make real network calls.
4. **Mock `localStorage`** — use `vi.stubGlobal` or `vitest`'s built-in fake for theme persistence tests.
5. **Use `userEvent` not `fireEvent`** — prefer `@testing-library/user-event` for interactions.
6. **Test behaviour, not implementation** — assert what the user sees and what functions get called, not internal state.
7. **One file per component** — co-locate `Component.test.jsx` next to `Component.jsx`.

### What to test per file

#### `QuickContact.test.jsx`
- Tab button is visible on render
- Clicking tab opens the drawer (drawer becomes visible)
- Clicking backdrop closes the drawer
- Clicking the ✕ button closes the drawer
- All form fields render inside the open drawer
- Submitting with required fields calls `submitLead` with correct payload including `source: "Quick Contact Widget"`
- Success state renders after submit resolves
- "Done" button closes the drawer and resets success state
- Body scroll is locked (`document.body.style.overflow`) when open, released when closed

#### `ThemeSwitch.test.jsx`
- Renders with the current theme label
- Clicking toggles to the other theme
- `localStorage.setItem` is called with the new theme key
- `document.documentElement.setAttribute("data-theme", ...)` is called

#### `ContactPage.test.jsx`
- All five fields render (name, email, phone, service, message)
- Submit calls `submitLead` with the correct field values
- Success message appears after submission
- Required field validation (name, email, message) prevents submission when empty

#### `Nav.test.jsx`
- All nav links render
- Clicking a link calls `navigate` with the correct page key
- Hamburger button is present (mobile menu trigger)
- Mobile menu opens when hamburger is clicked
- Mobile menu closes when a link inside it is clicked

#### `store.test.js`
- `setPage` updates `currentPage`
- `setTheme` updates `theme`, writes to `localStorage`, sets `data-theme` on `document.documentElement`
- Initial `theme` reads from `localStorage` if present

#### `leads.test.js`
- When `VITE_GOOGLE_SHEETS_URL` is empty, `submitLead` resolves without fetching
- When URL is set, `submitLead` calls `fetch` with correct method, headers, and JSON body
- Throws when `fetch` returns a non-ok response

### Example test pattern

```jsx
// QuickContact.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import QuickContact from "../components/QuickContact";

vi.mock("../leads", () => ({ submitLead: vi.fn().mockResolvedValue({}) }));

import { submitLead } from "../leads";

describe("QuickContact", () => {
  it("opens the drawer when the tab is clicked", async () => {
    render(<QuickContact />);
    await userEvent.click(screen.getByRole("button", { name: /get a free quote/i }));
    expect(screen.getByText("Get a Free Quote")).toBeInTheDocument();
  });

  it("calls submitLead with correct source on submit", async () => {
    render(<QuickContact />);
    await userEvent.click(screen.getByRole("button", { name: /get a free quote/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Jane Smith");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/message/i), "Need a quote");
    await userEvent.click(screen.getByRole("button", { name: /send inquiry/i }));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({ source: "Quick Contact Widget" })
    );
  });
});
```

---

## CSS conventions

- All colors come from CSS custom properties defined in `[data-theme]` blocks — never hardcode hex values in components or inline styles.
- New components get their own clearly labelled CSS block (`/* --- MY COMPONENT --- */`).
- Responsive styles go in the `/* --- RESPONSIVE --- */` section at the bottom.
- The two theme attribute selectors are `[data-theme="green"]` and `[data-theme="copper"]`. If you add a new color token, add it to **both** blocks.

## Deployment

```bash
npm run build
# Vercel auto-deploys on push to main, or:
vercel --prod
```
