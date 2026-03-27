# Domain, DNS & Email Infrastructure
**Homescape Construction** — `homescapeconstruction.com`
_Last updated: March 2026_

---

## Overview

| Layer | Provider | Role |
|---|---|---|
| Domain Registration | GoDaddy | Owns the domain name; nameservers delegated to Cloudflare |
| DNS Management | Cloudflare (free tier) | Authoritative DNS, proxying, email routing |
| Web Hosting | Vercel (`homescape-construction` team) | Hosts the marketing SPA |
| Email Routing | Cloudflare Email Routing | Forwards inbound mail to Gmail |
| Email Inbox | Gmail (`daveporter66@gmail.com`) | Receives all forwarded mail |
| CMS | Sanity.io (personal account) | Content management |

> **Important:** Because nameservers point to Cloudflare, all DNS changes must be made in the **Cloudflare dashboard** — not in GoDaddy. GoDaddy's DNS editor is completely bypassed and inert for this domain.

---

## Domain Registration — GoDaddy

- **Registrar:** GoDaddy
- **Domain:** `homescapeconstruction.com`
- **Nameservers (delegated to Cloudflare):**
  - `ivy.ns.cloudflare.com`
  - `margo.ns.cloudflare.com`

GoDaddy's only active role is renewing the domain registration annually. No DNS records should be created or edited there.

---

## DNS — Cloudflare

DNS is managed entirely in Cloudflare. Current records:

### A Records

| Name | Value | Proxy |
|---|---|---|
| `homescapeconstruction.com` | `74.220.199.6` | Proxied |
| `www` | `74.220.199.6` | Proxied |
| `*` (wildcard) | `74.220.199.6` | Proxied |

> ⚠️ **Pending:** These A records still point to the old HostMonster IP (`74.220.199.6`). Once the Vercel deployment is finalized, update all three to `76.76.21.21` (Vercel's IP) to bring the live site online.

### MX Records (Email Routing)

| Name | Value | Priority |
|---|---|---|
| `homescapeconstruction.com` | `route1.mx.cloudflare.net` | 20 |
| `homescapeconstruction.com` | `route2.mx.cloudflare.net` | 43 |
| `homescapeconstruction.com` | `route3.mx.cloudflare.net` | 36 |

### TXT Records

| Name | Purpose |
|---|---|
| `homescapeconstruction.com` | SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all` |
| `cf2024-1._domainkey` | DKIM signing key (Cloudflare-managed) |

---

## Email — Cloudflare Email Routing

Cloudflare Email Routing handles all inbound email. There is no paid email hosting — inbound messages are forwarded to an existing Gmail address.

### Configuration

- **Routing status:** Enabled
- **Catch-all rule:** Any address `*@homescapeconstruction.com` → forward to `daveporter66@gmail.com`
- **Explicit rule:** `info@homescapeconstruction.com` → forward to `daveporter66@gmail.com`
- **Destination address:** `daveporter66@gmail.com` — Verified ✓

### How it works

```
Sender → info@homescapeconstruction.com
           ↓
    Cloudflare Email Routing
           ↓
    daveporter66@gmail.com
```

### Limitations of this setup

- **Inbound only.** You can receive mail at `info@homescapeconstruction.com` but you cannot _send_ mail from it natively. Replies will show `daveporter66@gmail.com` as the sender unless Gmail "Send As" is configured.
- **No shared inbox.** Only one destination address is currently configured.

### Optional: Gmail "Send As" (free)

To send email _from_ `info@homescapeconstruction.com` via Gmail:

1. In Gmail → Settings → Accounts → **Send mail as** → Add another address
2. Enter `info@homescapeconstruction.com`
3. Use Gmail's SMTP server: `smtp.gmail.com`, port 587
4. Authenticate with your Google account credentials
5. Gmail will send a verification code to `info@` — which will arrive in your inbox via the forwarding rule already in place

Once verified, you can choose `info@homescapeconstruction.com` as the From address when composing in Gmail.

---

## Web Hosting — Vercel

- **Team scope:** `homescape-construction`
- **GitHub repo:** `dadamschi/homescape`
- **Local project path:** `/Users/dadamsgs/work/homescape`
- **Target production domain:** `homescapeconstruction.com`
- **Vercel IP (for A record):** `76.76.21.21`

> The domain has been added to Vercel via `vercel domains add homescapeconstruction.com --scope homescape-construction`. The A records in Cloudflare still need to be updated from the HostMonster IP to Vercel's IP before the live site will resolve correctly.

---

## Pending Tasks

- [ ] Update Cloudflare A records from `74.220.199.6` → `76.76.21.21` (Vercel)
- [ ] Configure Gmail "Send As" for `info@homescapeconstruction.com`
- [ ] Deploy Sanity Studio
- [ ] Migrate project image URLs across six Sanity documents
- [ ] Update Sanity CORS origins to include `https://homescapeconstruction.com`
- [ ] Set up Google Apps Script Web App for lead capture form

---

## Consolidation Recommendations

The current setup uses four separate services (GoDaddy, HostMonster, Cloudflare, Vercel) where two or three would suffice. Here's an honest assessment:

### Option A — Keep Cloudflare, transfer domain away from GoDaddy ✅ Recommended

Transfer the domain registration from GoDaddy to **Cloudflare Registrar**.

**Why:**
- Cloudflare sells domains at cost (no markup) — typically $10–12/year vs GoDaddy's renewal prices which often jump significantly after year one
- Everything — DNS, email routing, domain registration — lives in one dashboard
- Eliminates the confusion of "why can't I edit DNS in GoDaddy" permanently
- No nameserver delegation needed; Cloudflare is natively authoritative

**How:** Cloudflare Dashboard → Domain Registration → Transfer domain. You'll need the EPP/authorization code from GoDaddy. Can only be done 60 days after last transfer.

---

### Option B — Add Google Workspace (~$6/month)

If the business needs a proper `info@homescapeconstruction.com` mailbox (not just forwarding), Google Workspace Starter is the cleanest option.

**What you get:**
- Full Gmail inbox at `info@homescapeconstruction.com`
- Send _and_ receive from the custom domain natively
- Google Drive, Docs, Meet included
- Easy to add more addresses later (e.g. `dave@homescapeconstruction.com`)

**What changes:** You'd replace the Cloudflare Email Routing MX records with Google's MX records. Cloudflare email routing would no longer be needed.

**Verdict:** Overkill for a one-person operation right now. The free Gmail "Send As" approach covers 90% of the need. Revisit if the business starts hiring or needs shared inboxes.

---

### Option C — Migrate DNS to Vercel (not recommended)

Vercel offers DNS management. You _could_ point nameservers there instead of Cloudflare.

**Why not:** Cloudflare's free tier provides DDoS protection, caching, analytics, and Email Routing that Vercel doesn't replicate. No reason to move.

---

### Summary Recommendation

| Action | Priority | Cost |
|---|---|---|
| Transfer domain from GoDaddy to Cloudflare Registrar | Medium — do at next renewal | ~$10–12/yr (saves vs GoDaddy renewal) |
| Configure Gmail "Send As" | High — do now | Free |
| Update A records to Vercel IP | High — do when ready to go live | Free |
| Add Google Workspace | Low — revisit if business grows | $6/month |

The single highest-leverage move is **Gmail Send As** (free, 15 minutes of work) — it gives a professional send address immediately without any new services or cost.
