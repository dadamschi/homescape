# Blog Publishing Workflow

A simple runbook for publishing quality blog posts on a steady cadence.

> **Background:** The site previously had ~115 thin, near-duplicate posts that were deleted.
> This plan covers the fresh-start workflow with quality-first content.

---

## Schema Reference

| Field                 | Type                        | Notes                                                                             |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| `_type`               | `blogPost`                  | Document type                                                                     |
| `title`               | string                      | No brand suffix                                                                   |
| `slug`                | slug                        | Auto-generated from title                                                         |
| `author`              | string                      | E.g., "Dave / Homescape Construction"                                             |
| `publishedAt`         | datetime                    | **Leave blank when drafting**                                                     |
| `excerpt`             | text (160 chars)            | Used for meta description                                                         |
| `mainImage`           | image + alt                 | Required for each post                                                            |
| `body`                | Portable Text               | Article content                                                                   |
| `categories`          | array                       | Remodeling, Permits, Seasonal, Projects, Guides, Chicago Trends, Home Improvement |
| `serviceType`         | string                      | For Service schema markup                                                         |
| `seo.metaTitle`       | string (60 chars)           | Override title, include ONE `                                                     | Homescape Construction` |
| `seo.metaDescription` | text (160 chars)            | Override excerpt                                                                  |
| `faq`                 | array of {question, answer} | For FAQPage schema markup                                                         |

---

## 1. Content Creation

Use the `/contractor-blog-writer` skill to create posts. Key requirements:

- **700–1,200 words** for service/guide posts
- **500–800 words** for permit-data/seasonal posts
- **Lead answer** in first 40–60 words
- **FAQ section** with 3–5 Q&As
- **Unique mainImage** per post
- **One soft CTA** at the end

Posts are created as **drafts** with `publishedAt` blank.

---

## 2. Publishing Cadence

**Recommended:** 1–2 posts per week (Tuesday/Thursday at 9am Chicago time)

### To publish a post:

1. Review the draft in Sanity Studio
2. Add/confirm `mainImage` with alt text
3. Set `publishedAt` to your target date/time
4. Click Publish

The frontend filters by `publishedAt <= now()`, so:

- Future-dated posts are invisible until their time arrives
- Posts go live automatically when the date passes (via ISR revalidation)

---

## 3. Post Types to Prioritize

| Priority   | Type                 | Examples                                         |
| ---------- | -------------------- | ------------------------------------------------ |
| **High**   | Service pages        | "Kitchen Remodeling Costs in Chicago"            |
| **High**   | Guides               | "ADU vs. Addition: Chicago Homeowner's Guide"    |
| **Medium** | Project case studies | "Lincoln Park Greystone: Full Gut Rehab"         |
| **Medium** | Seasonal advice      | "When to Schedule Tuckpointing in Chicago"       |
| **Low**    | Permit data          | Only if genuinely newsworthy with a useful angle |

---

## 4. Quality Gates

Before publishing, verify:

- [ ] Title is specific, under 60 characters, no doubled brand suffix
- [ ] Lead answer in first 40–60 words
- [ ] Meets word floor (700+ for service/guide, 500+ for others)
- [ ] Has FAQ section with 3–5 Q&As
- [ ] `mainImage` is set with descriptive alt text
- [ ] `seo.metaTitle` has exactly one `| Homescape Construction`
- [ ] `seo.metaDescription` under 160 chars with location
- [ ] No fabricated data — ranges labeled as estimates
- [ ] Chicago-specific detail (neighborhoods, permits, weather)

---

## 5. Sitemap & ISR

The frontend is configured with:

- **Sitemap** at `/sitemap.xml` — filters by `publishedAt <= now()`
- **ISR revalidation** — blog pages revalidate periodically
- **Date gating** — queries use `publishedAt <= now()` filter

Future-dated posts appear once:

1. Their `publishedAt` time passes, AND
2. The page is revalidated (happens automatically within the ISR window)

---

## 6. Monthly Content Ideas

**Evergreen service pages (create once, high value):**

- Kitchen Remodeling Costs in Chicago
- Bathroom Renovation Guide for Chicago Homes
- Chicago ADU & Coach House Building Guide
- Home Addition Costs: Chicago Pricing Guide
- Basement Finishing in Chicago: What to Know

**Seasonal rotation:**

- Spring: Tuckpointing timing, porch repairs, foundation checks
- Summer: Peak construction scheduling, permit processing times
- Fall: Winterization, masonry deadlines, interior project planning
- Winter: Planning next year's projects, budgeting, permits to pull early

**Project spotlights (as completed):**

- Neighborhood + project type + what made it interesting
- Include real numbers where client approves
- Photos with proper credits
