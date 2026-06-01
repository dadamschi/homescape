---
name: contractor-blog-writer
description: >
  Write high-quality, genuinely useful blog posts for a local home-construction /
  remodeling company (Homescape Construction, Chicago). Use this skill whenever the
  user wants to draft, rewrite, expand, or de-duplicate a contractor/construction blog
  post, plan blog topics, turn a permit record or project into an article, or improve
  thin/templated posts flagged in an SEO audit. Trigger on phrases like "write a blog
  post", "rewrite this post", "blog topic ideas", "expand this article", "make this post
  rank", "turn this project into a post", or any request to produce construction/remodeling
  content for the website. Produces Sanity-ready Markdown with proper structure, FAQ
  content, and SEO/GEO/AEO best practices baked in — NOT thin, near-duplicate filler.
---

# Contractor Blog Writer

Write blog posts for **Homescape Construction** — an owner-operated Chicago home builder
and remodeling contractor — that real homeowners find useful and that search engines and
AI answer engines are happy to surface and cite.

This skill exists to fix a specific failure mode found in the site's audit: **lots of
short, heavily templated, near-duplicate posts** (dozens of "express permits zero-day" and
"solar battery storage standard" variants, ~325 words each, one generic CTA heading). The
job here is the opposite of that: fewer, deeper, distinctive posts.

---

## The non-negotiables (read first)

1. **One post = one genuinely distinct topic.** Before writing, check it isn't a rehash of
   an existing post. If it is, the right move is to _expand/merge_, not publish another
   variant. When in doubt, ask the user "is there already a post on this?"
2. **Minimum substance.** Target **700–1,200 words** for evergreen/service posts, **500–800**
   for a timely news/permit-data post. If you can't reach the floor honestly, the topic is
   too thin — combine it with a related angle.
3. **Lead with a real answer, not a windup.** The first paragraph must answer the title's
   implied question directly (this is what wins featured snippets and AI citations).
4. **Show local + specific expertise.** Chicago neighborhoods, IL/Chicago permit realities,
   freeze-thaw and masonry seasonality, real numbers. Generic "quality craftsmanship" filler
   is banned.
5. **Never fabricate.** No invented permit numbers, prices, addresses, client names, stats,
   or "studies." If a specific figure isn't supplied or verifiable, write in ranges and say
   so ("typically $X–$Y in the Chicago market"). See `references/voice-and-eeat.md`.
6. **Honest E-E-A-T.** Attribute to a real person where possible (e.g. "Dave, master
   carpenter, 20+ yrs"). Don't claim certifications, awards, or review counts that aren't real.

---

## Workflow

### Step 1 — Establish the brief

Gather (ask only for what's missing; infer the rest):

- **Topic / angle** and the _primary question_ a homeowner is really asking.
- **Post type**: `service` (evergreen, e.g. "kitchen remodel cost in Chicago"),
  `project` (a real job you did), `permit-data` (a real permit record with a cost hook),
  `seasonal` (timing/maintenance advice), or `guide` (how-to / decision-making).
- **Any real specifics** the user can supply: project address/neighborhood, costs, dates,
  materials, client quote (with permission), permit fee. These make the post un-duplicatable.
- **Target keyword / search phrase** if they have one; otherwise propose one.

If the user hands you an existing thin post to fix, read `references/rewrite-playbook.md`
and follow the expand-or-merge decision there.

### Step 2 — Pick the structure

Choose the matching template in `references/templates.md` and follow it. All templates share
this skeleton:

- **H1** = the post title (specific, no doubled brand suffix — see audit bug note below).
- **Lead answer** — 40–60 words directly answering the core question.
- **3–6 H2 sections**, at least one or two phrased as a natural question
  ("How much does a kitchen remodel cost in Lincoln Park?").
- **Specifics**: a cost range, a list, or a small comparison table.
- **FAQ section** — 3–5 real questions with concise (40–60 word) answers. This is the
  AEO/GEO payload; do not skip it.
- **Soft CTA** at the end (one, not three). Link to /contact or a relevant service.

### Step 3 — Write it

Follow `references/voice-and-eeat.md` for tone and the anti-AI-slop rules. Key moves:

- Concrete over abstract. "Chicago's freeze-thaw cycle means footings below the 42-inch
  frost line" beats "we use quality materials."
- Vary sentence length. Short punches. Then a longer sentence that earns its length by
  carrying a real detail.
- Use the homeowner's actual vocabulary, not industry jargon (define jargon when used).
- Internal links: reference 1–3 related posts/services by topic so the editor can wire them.
- No keyword stuffing, no "In today's market," no "When it comes to," no "Look no further."

### Step 4 — Output as Sanity-ready Markdown

Produce the post using the **front-matter contract** below so it imports cleanly. The exact
field names depend on the schema — confirm against the Studio (Inspect JSON) and adjust keys
if needed. Default to these and flag any you're unsure of:

```markdown
---
_type: blogPost
title: "Specific, Useful Title — No Doubled Brand Suffix"
slug: specific-useful-title
excerpt: "One-sentence summary that doubles as the meta description (≤160 chars)."
publishedAt: "" # LEAVE BLANK — the drip-publish plan assigns this
author: "Dave / Homescape Construction" # prefer a real person
categories: ["Remodeling"] # options: Remodeling, Permits, Seasonal, Projects, Guides, Chicago Trends, Home Improvement
mainImage: "" # Sanity image asset ref; never reuse the same hero on every post
seo:
  metaTitle: "Specific, Useful Title | Homescape Construction" # SINGLE brand suffix only
  metaDescription: "≤160 chars, includes the location + primary phrase."
faq: # powers FAQPage schema markup
  - question: "How much does X cost in Chicago?"
    answer: "40–60 word direct answer."
---

# Specific, Useful Title

[40–60 word lead answer.]

## How much does it actually cost?

...

## (more H2 sections)

...

## Frequently asked questions

**How much does X cost in Chicago?**
[40–60 word answer — mirror the faq front-matter.]
```

> **Why `publishedAt` is blank:** you're rolling these out slowly. Dates are assigned by the
> drip-publish plan, not at write time. See `BLOG_DRIP_PUBLISH_PLAN.md`.

### Step 5 — Self-check before handing back

Run the checklist in `references/quality-checklist.md`. If any item fails, fix it before
presenting. Never present a post that's under the word floor or missing the lead answer / FAQ.

---

## Two audit bugs to never reproduce

- **Doubled title suffix.** The live site emitted `... | Homescape Construction | Homescape
Construction`. The `seo.metaTitle` must carry **exactly one** ` | Homescape Construction`.
  Don't append the brand inside `title` too.
- **Missing social image.** Posts referenced a 404'd `og-image.jpg`. Every post needs a real
  `mainImage`, and don't reuse one hero image across all posts (the portfolio did this).

---

## Reference files

- `references/templates.md` — the 5 post-type templates (service, project, permit-data,
  seasonal, guide). Read the one matching the brief.
- `references/voice-and-eeat.md` — tone, anti-slop rules, honesty/E-E-A-T guardrails,
  banned phrases.
- `references/rewrite-playbook.md` — how to fix a thin/duplicate post: the expand-vs-merge
  decision, deduplication, and redirect notes.
- `references/quality-checklist.md` — the pre-handoff checklist (word floor, structure, FAQ,
  local specificity, no fabrication, single brand suffix).

Read the specific reference file(s) relevant to the task rather than all of them.
