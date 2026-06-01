# Rewrite & De-Duplication Playbook

Use this when handed an existing thin or duplicate post (the audit found ~115 posts averaging
~325 words with many near-identical titles). The default instinct should be **expand or merge,
not republish a variant.**

## Step 1 — Cluster check

Before improving a single post, ask: how many other posts cover the same angle? The known
over-produced clusters from the audit:

- "express permits zero-day / same-day processing" (many variants)
- "solar + battery storage becomes standard" (many variants)
- "tuckpointing / masonry spring season" (several)
- "contractor changes mid-project = red flag" (several)
- "detached garage costs $X" (several)

If the post belongs to a cluster, go to Step 2. If it's genuinely standalone, go to Step 3.

## Step 2 — Merge a cluster into one canonical post

1. Pick the **strongest** post in the cluster as the canonical survivor (best slug, most useful
   angle, any real data).
2. Pull the *one unique fact* from each sibling (a specific number, date, neighborhood) into the
   survivor so nothing useful is lost.
3. Expand the survivor to the word floor (500–800 for permit-data, 700+ for evergreen) using the
   matching template in `templates.md`. Add a lead answer and an FAQ block if missing.
4. Mark the siblings for **deletion + 301 redirect** to the survivor's slug. Provide the redirect
   list to the user as `oldSlug -> survivorSlug`.
5. Result: one strong post replaces a dozen thin ones. This is the single biggest SEO/GEO win.

## Step 3 — Expand a standalone thin post

1. Keep the slug (preserves any existing equity); fix the title only if it has the doubled brand
   suffix.
2. Add the **lead answer** (40–60 words) directly under the H1.
3. Add **question-phrased H2s** and at least one concrete number, list, or table.
4. Add a **FAQ block** (mirror into front-matter `faq`).
5. Reach the word floor honestly — if you can't, the post is a merge candidate, not a standalone.
6. Add/replace `mainImage` with a real, unique image (never the shared hero).

## Step 4 — Dates and rollout

Do **not** set `publishedAt` here. De-duplication changes *which* posts exist; the
`BLOG_DRIP_PUBLISH_PLAN.md` decides *when* the survivors go live. Hand the survivor back with
`publishedAt` blank and note its suggested quality rank (so the drip plan can order it).

## Output of a rewrite task

For each cluster/post handled, return:
- The rewritten survivor as Sanity-ready Markdown (per SKILL.md front-matter contract).
- A redirect list (`oldSlug -> survivorSlug`) for any merged/deleted siblings.
- A one-line note on suggested quality rank (high / medium) for drip ordering.
