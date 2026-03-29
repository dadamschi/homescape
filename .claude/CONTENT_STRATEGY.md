# Homescape Construction — Content & SEO Strategy

Last updated: March 2026

---

## Overview

Content strategy focused on generating organic traffic and backlinks through locally-relevant, authoritative content about Chicago construction.

**Goals:**
- Establish authority in Chicago construction space
- Generate backlinks from local blogs, real estate sites, news outlets
- Improve GEO (Generative Engine Optimization) for AI search citations
- Drive qualified leads through valuable content

---

## Current Implementation

### Automated Blog Generation

**Status:** Active
**Frequency:** Weekly (Sunday 9am Chicago)
**Mechanism:** GitHub Actions → `/api/generate-blog` → Claude API → Sanity drafts

**Data Sources:**
| Source | Data | Use |
|--------|------|-----|
| Chicago Data Portal | Building permits | Neighborhood trends, permit activity |
| OpenWeatherMap | Current weather | Seasonal construction tips |

**Output:** 2-3 short, focused posts per week covering:
- Chicago Trends (permit activity, neighborhood development)
- Seasonal Tips (weather-related construction advice)
- Industry News (local construction updates)
- Home Improvement (practical homeowner advice)

---

## Backlink Strategy

### Tier 1: Evergreen Resource Pages (High Priority)

These pages provide lasting value and attract natural backlinks from realtors, architects, journalists, and homeowners.

#### 1. Chicago Construction Permit Guide
**URL:** `/guides/chicago-permits`
**Content:**
- Step-by-step permit process by project type
- Timeline expectations
- Cost breakdown
- Common pitfalls
- Links to official city resources

**Backlink targets:** Real estate blogs, architecture firms, other contractors, local news

#### 2. Chicago Renovation Cost Guide
**URL:** `/guides/renovation-costs`
**Content:**
- Average costs by project type (kitchen, bathroom, addition)
- Cost variations by neighborhood (Lincoln Park vs Pilsen vs suburbs)
- Factors affecting price
- Updated quarterly with real data

**Backlink targets:** Real estate sites, home buyers, financial planning blogs

#### 3. Chicago ADU & Coach House Guide
**URL:** `/guides/chicago-adu`
**Content:**
- Current Chicago ADU regulations
- Zoning requirements by area
- Design considerations
- Cost estimates
- Permit process specific to ADUs

**Backlink targets:** Housing advocacy groups, urban planning blogs, real estate investors

#### 4. Historic District Renovation Guide
**URL:** `/guides/historic-renovation`
**Content:**
- Landmarked areas in Chicago
- Commission approval process
- Material requirements
- Tax incentives
- Case studies

**Backlink targets:** Preservation societies, architecture blogs, neighborhood associations

#### 5. Hiring a Chicago Contractor Checklist
**URL:** `/guides/hiring-contractor`
**Content:**
- License verification (link to IDFPR lookup)
- Insurance requirements
- Red flags to watch for
- Contract essentials
- Dispute resolution

**Backlink targets:** Consumer protection sites, real estate agents, legal blogs

---

### Tier 2: Interactive Tools (Medium Priority)

Tools provide unique value and encourage sharing/linking.

#### 1. Renovation Cost Calculator
**URL:** `/tools/cost-calculator`
**Features:**
- Select project type
- Enter square footage
- Choose finish level
- Get estimated range
- Compare to Chicago averages

#### 2. Permit Requirement Checker
**URL:** `/tools/permit-checker`
**Features:**
- Select project type
- Answer qualifying questions
- Get permit requirements
- Link to application forms

#### 3. Energy Savings Estimator
**URL:** `/tools/energy-savings`
**Features:**
- Current heating/cooling costs
- Proposed improvements
- Estimated savings
- Available rebates (ComEd, Nicor, city programs)

---

### Tier 3: Neighborhood Pages (SEO/Local)

Programmatic pages targeting local search.

**URL pattern:** `/areas/[neighborhood]`

**Neighborhoods to target:**
- Lincoln Park
- Lakeview
- Wicker Park / Bucktown
- Logan Square
- Pilsen
- Hyde Park
- Oak Park
- Evanston
- Naperville

**Content per page:**
- Neighborhood construction trends
- Common project types
- Permit considerations
- Recent Homescape projects in area
- Local testimonials

---

## Additional Data Sources to Integrate

### City of Chicago Data Portal
| Dataset | API Endpoint | Use |
|---------|--------------|-----|
| Building Permits | `ydr8-5enu` | Current: permit trends |
| Zoning Applications | `uqhs-j723` | Zoning change alerts |
| 311 Requests | `v6vf-nfxy` | Infrastructure issues by area |
| Landmarks | `tdab-kixi` | Historic district data |
| Building Violations | `22u3-xenr` | Code compliance insights |

### External APIs
| Source | Data | Priority |
|--------|------|----------|
| Zillow API | Home values, market trends | Medium |
| NAHB | Housing market index | Low |
| BLS | Construction labor costs | Low |
| Energy Star | Rebate programs | Medium |
| ComEd/Nicor | Local utility rebates | High |

### RSS Feeds
| Source | Feed | Content |
|--------|------|---------|
| Block Club Chicago | `blockclubchicago.org/feed` | Neighborhood news |
| Chicago Tribune Real Estate | RSS | Market updates |
| Curbed Chicago (archive) | — | Development news |

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] Automated blog generation
- [x] Blog listing and post pages
- [x] GitHub Actions cron
- [ ] Add remaining env vars to Vercel

### Phase 2: Resource Pages (Next)
- [ ] Create `/guides` route structure
- [ ] Chicago Permit Guide
- [ ] Renovation Cost Guide
- [ ] Add to sitemap and navigation

### Phase 3: Enhanced Data Sources
- [ ] Add 311 data to blog generation
- [ ] Add zoning change alerts
- [ ] Integrate energy rebate data

### Phase 4: Interactive Tools
- [ ] Cost calculator component
- [ ] Permit checker wizard
- [ ] Save/share functionality

### Phase 5: Neighborhood Pages
- [ ] Programmatic page generation
- [ ] Neighborhood-specific GROQ queries
- [ ] Local schema markup

---

## Content Guidelines

### Voice & Tone
- Professional but approachable
- Authoritative without being condescending
- Chicago-specific references (neighborhoods, weather, local context)
- Actionable advice over generic tips

### SEO Best Practices
- One H1 per page
- Descriptive H2s with keywords
- Internal links to related content
- External links to authoritative sources (city sites, code references)
- Schema markup (Article, HowTo, FAQ)

### E-E-A-T Signals
- **Experience:** Reference Homescape projects, years in business
- **Expertise:** Cite specific codes, regulations, industry standards
- **Authoritativeness:** Link to official sources, use accurate data
- **Trustworthiness:** Clear contact info, license numbers, transparent pricing

### AI Citation Optimization (GEO)
- Direct answers to common questions
- Structured data for easy extraction
- Clear section headings
- Factual, citable statistics
- Updated dates visible

---

## Measurement

### KPIs
| Metric | Target | Tool |
|--------|--------|------|
| Organic traffic | +50% in 6 months | Google Analytics |
| Backlinks | 20 new domains | Ahrefs/SEMrush |
| AI citations | Appear in AI Overviews | Manual monitoring |
| Lead form submissions | +25% | Internal tracking |
| Time on page (guides) | >3 minutes | Google Analytics |

### Backlink Tracking
- Monitor new referring domains monthly
- Track which content earns links
- Identify outreach opportunities

---

## Outreach Strategy

### Link Building Tactics
1. **Local press:** Pitch neighborhood-specific data to Block Club, Tribune
2. **Real estate partnerships:** Offer guides as resources for agents
3. **Industry associations:** HBA of Greater Chicago, local contractor groups
4. **Guest posts:** Chicago-focused home improvement blogs
5. **HARO/Connectively:** Respond to journalist queries about construction

### Social Amplification
- Share guides on LinkedIn (B2B)
- Neighborhood Facebook groups (B2C)
- Instagram project showcases with guide links