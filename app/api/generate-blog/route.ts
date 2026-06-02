import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { sanityWriteClient } from "@/lib/sanity";

// Read content guidelines from CLAUDE.md at module load
const CONTENT_GUIDELINES = readFileSync(
  join(process.cwd(), "app/api/generate-blog/CLAUDE.md"),
  "utf-8"
);

// Read SEO keyword clusters and targeting guidance
const SEO_KEYWORDS = readFileSync(
  join(process.cwd(), "app/api/generate-blog/seo-implementation-guide.md"),
  "utf-8"
);

const CRON_SECRET = process.env.CRON_SECRET;

// Types for external APIs
interface ChicagoPermit {
  permit_: string;
  permit_type: string;
  work_description: string;
  street_number: string;
  street_direction?: string;
  street_name: string;
  community_area: string;
  issue_date: string;
  estimated_cost?: string;
}

interface EnergyBenchmark {
  address: string;
  chicago_energy_rating: string;
  gross_floor_area_buildings_sq_ft: string;
  community_area: string;
  data_year: string;
  zip_code: string;
}

interface Landmark {
  name: string;
  address: string;
  date_built: string;
  architect: string;
  landmark: string; // designation date
}

interface ZoningDistrict {
  zone_class: string;
  zone_type: string;
}

// Data source rotation - cycles through: permits, energy, landmarks, zoning
type DataSourceType = "permits" | "energy" | "landmarks" | "zoning";

function getWeeklyDataSource(): DataSourceType {
  const sources: DataSourceType[] = ["permits", "energy", "landmarks", "zoning"];
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return sources[weekNumber % sources.length];
}

interface WeatherData {
  weather: Array<{ main: string; description: string }>;
  main: { temp: number; feels_like: number; humidity: number };
  name: string;
}

interface BlogPostFAQ {
  question: string;
  answer: string;
}

interface BlogPostSEO {
  metaTitle: string;
  metaDescription: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  body: string;
  categories: string[];
  serviceType?: string | null;
  seo: BlogPostSEO;
  faq: BlogPostFAQ[];
}

interface GeneratedPosts {
  posts: BlogPost[];
}

interface ExistingPost {
  title: string;
  slug: string;
  categories: string[];
  excerpt: string;
  publishedAt: string;
}

// Fetch recent Chicago building permits
async function fetchChicagoPermits(): Promise<ChicagoPermit[]> {
  try {
    const res = await fetch(
      "https://data.cityofchicago.org/resource/ydr8-5enu.json?$limit=10&$order=issue_date%20DESC",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Permits API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch permits:", error);
    return [];
  }
}

// Fetch existing blog posts for internal linking
async function fetchExistingPosts(): Promise<ExistingPost[]> {
  try {
    const posts = await sanityWriteClient.fetch<ExistingPost[]>(
      `*[_type == "blogPost" && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...20] {
        title,
        "slug": slug.current,
        categories,
        excerpt,
        publishedAt
      }`
    );
    return posts;
  } catch (error) {
    console.error("Failed to fetch existing posts:", error);
    return [];
  }
}

// Fetch Chicago Energy Benchmarking data
async function fetchEnergyBenchmarks(): Promise<EnergyBenchmark[]> {
  try {
    const res = await fetch(
      "https://data.cityofchicago.org/resource/xq83-jr8c.json?$limit=15&$order=data_year%20DESC&$where=chicago_energy_rating%20IS%20NOT%20NULL",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Energy API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch energy data:", error);
    return [];
  }
}

// Fetch Chicago Landmarks data (Individual Landmarks dataset)
async function fetchLandmarks(): Promise<Landmark[]> {
  try {
    const res = await fetch(
      "https://data.cityofchicago.org/resource/uct4-hrvh.json?$limit=15&$order=landmark%20DESC",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Landmarks API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch landmarks:", error);
    return [];
  }
}

// Fetch Chicago Zoning district types
async function fetchZoningTypes(): Promise<ZoningDistrict[]> {
  try {
    const res = await fetch(
      "https://data.cityofchicago.org/resource/nifi-zqag.json?$select=zone_class,zone_type&$group=zone_class,zone_type&$limit=30",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Zoning API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch zoning:", error);
    return [];
  }
}

// Fetch current Chicago weather
async function fetchWeather(): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Chicago,US&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

// Link mark definition type
interface LinkMarkDef {
  _type: "link";
  _key: string;
  href: string;
}

// Convert markdown to Portable Text blocks with link support
function markdownToPortableText(markdown: string) {
  const blocks: Array<{
    _type: "block";
    _key: string;
    style: string;
    children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }>;
    markDefs: LinkMarkDef[];
  }> = [];

  const lines = markdown.split("\n");
  let keyCounter = 0;

  const generateKey = () => `key-${keyCounter++}`;

  // Parse inline markdown links and return children array with markDefs
  function parseLineWithLinks(text: string): {
    children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }>;
    markDefs: LinkMarkDef[];
  } {
    const children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }> = [];
    const markDefs: LinkMarkDef[] = [];

    // Regex to match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        children.push({
          _type: "span",
          _key: generateKey(),
          text: text.slice(lastIndex, match.index),
          marks: [],
        });
      }

      // Create link mark definition
      const linkKey = generateKey();
      markDefs.push({
        _type: "link",
        _key: linkKey,
        href: match[2],
      });

      // Add linked text with mark reference
      children.push({
        _type: "span",
        _key: generateKey(),
        text: match[1],
        marks: [linkKey],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last link
    if (lastIndex < text.length) {
      children.push({
        _type: "span",
        _key: generateKey(),
        text: text.slice(lastIndex),
        marks: [],
      });
    }

    // If no links found, return the whole text as a single span
    if (children.length === 0) {
      children.push({
        _type: "span",
        _key: generateKey(),
        text,
        marks: [],
      });
    }

    return { children, markDefs };
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let style = "normal";
    let text = trimmed;

    // Handle headings
    if (trimmed.startsWith("### ")) {
      style = "h3";
      text = trimmed.slice(4);
    } else if (trimmed.startsWith("## ")) {
      style = "h2";
      text = trimmed.slice(3);
    } else if (trimmed.startsWith("# ")) {
      style = "h1";
      text = trimmed.slice(2);
    }

    const { children, markDefs } = parseLineWithLinks(text);

    blocks.push({
      _type: "block",
      _key: generateKey(),
      style,
      children,
      markDefs,
    });
  }

  return blocks;
}

// Generate URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Data source context for prompts
interface DataContext {
  type: DataSourceType;
  permits: ChicagoPermit[];
  energy: EnergyBenchmark[];
  landmarks: Landmark[];
  zoning: ZoningDistrict[];
  weather: WeatherData | null;
  existingPosts: ExistingPost[];
}

// Build the prompt for Claude based on rotating data source
function buildPrompt(ctx: DataContext): string {
  // Format primary data section based on this week's source
  let primaryDataSection = "";
  let topicGuidance = "";

  switch (ctx.type) {
    case "permits":
      primaryDataSection =
        ctx.permits.length > 0
          ? `## This Week's Focus: Recent Chicago Building Permits\n${JSON.stringify(ctx.permits.slice(0, 8), null, 2)}`
          : "No recent permit data available.";
      topicGuidance = `Write about PERMITS and COSTS. Use the real permit data above to discuss:
- What specific permit costs tell homeowners about project pricing
- Permit processing times and what to expect
- Work types and scope from real permits`;
      break;

    case "energy":
      primaryDataSection =
        ctx.energy.length > 0
          ? `## This Week's Focus: Chicago Energy Benchmarking Data\n${JSON.stringify(ctx.energy.slice(0, 10), null, 2)}`
          : "No energy benchmarking data available.";
      topicGuidance = `Write about ENERGY EFFICIENCY. Use the benchmarking data to discuss:
- How building size affects energy costs in Chicago
- Chicago Energy Rating and what it means for homeowners
- Energy upgrades that improve ratings (insulation, windows, HVAC)`;
      break;

    case "landmarks":
      primaryDataSection =
        ctx.landmarks.length > 0
          ? `## This Week's Focus: Chicago Landmarks\n${JSON.stringify(ctx.landmarks.slice(0, 10), null, 2)}`
          : "No landmarks data available.";
      topicGuidance = `Write about HISTORIC RENOVATION. Use the landmarks data to discuss:
- Renovating in Chicago's landmark districts
- Permit and approval requirements for historic properties
- Balancing preservation with modern updates
- Working with the Chicago Landmarks Commission`;
      break;

    case "zoning":
      primaryDataSection =
        ctx.zoning.length > 0
          ? `## This Week's Focus: Chicago Zoning Districts\nCommon zone classes: ${ctx.zoning
              .slice(0, 15)
              .map((z) => z.zone_class)
              .join(", ")}`
          : "No zoning data available.";
      topicGuidance = `Write about ZONING and ADUs. Explain zoning classifications and discuss:
- What RS (residential single-family) vs RM (residential multi-family) means
- Zoning requirements for ADUs, coach houses, and additions
- How to check zoning before starting a project
- Common zoning variances homeowners request`;
      break;
  }

  const weatherSection = ctx.weather
    ? `## Current Chicago Weather\nConditions: ${ctx.weather.weather[0]?.description || "N/A"}\nTemperature: ${Math.round(ctx.weather.main.temp)}°F (feels like ${Math.round(ctx.weather.main.feels_like)}°F)\nHumidity: ${ctx.weather.main.humidity}%`
    : "";

  const existingPostsSection =
    ctx.existingPosts.length > 0
      ? `## Existing Blog Posts (for internal linking)\nLink to relevant posts using markdown format: [anchor text](/blog/slug)\n\n${ctx.existingPosts.map((p) => `- "${p.title}" (/blog/${p.slug}) - ${p.categories?.join(", ") || "General"}`).join("\n")}`
      : "";

  return `You are a content writer for Homescape Construction. Follow the guidelines below exactly.

---

# CONTENT GUIDELINES

${CONTENT_GUIDELINES}

---

# SEO KEYWORD TARGETING

${SEO_KEYWORDS}

---

# CURRENT DATA

${primaryDataSection}

${weatherSection}

${existingPostsSection}

---

# YOUR TASK

${topicGuidance}

Generate ONE high-quality blog post (NOT thin content). The post MUST:
- Meet the word count minimums: 700-1,200 words for evergreen/service posts, 500-800 for data-driven posts
- Include a lead answer (40-60 words) directly under the title
- Have at least one H2 phrased as a natural question
- Include an FAQ section with 3-5 Q&As (40-60 words each answer)
- Reference specific data points from the Chicago data above
- End with a single soft CTA

**Internal Linking Requirements:**
- Each post should include 1-2 internal links to relevant existing posts from the list above
- Use natural anchor text that fits the sentence context
- Format: [descriptive anchor text](/blog/slug)

**External Linking Requirements:**
- Include 1-2 external links to authoritative sources
- Prefer .gov and .org sources (Chicago Building Dept, EPA, ENERGY STAR, etc.)
- Format: [descriptive anchor text](https://full-url)

Respond ONLY with valid JSON (no markdown code blocks).`;
}

export async function POST(request: NextRequest) {
  // Verify cron secret (Vercel sends Bearer token)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for required API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json({ error: "SANITY_WRITE_TOKEN not configured" }, { status: 500 });
  }

  try {
    // 1. Determine this week's data source
    const dataSourceType = getWeeklyDataSource();
    console.log(`This week's data source: ${dataSourceType}`);

    // 2. Fetch all data sources in parallel (we need weather and existing posts regardless)
    const [permits, energy, landmarks, zoning, weather, existingPosts] = await Promise.all([
      dataSourceType === "permits" ? fetchChicagoPermits() : Promise.resolve([]),
      dataSourceType === "energy" ? fetchEnergyBenchmarks() : Promise.resolve([]),
      dataSourceType === "landmarks" ? fetchLandmarks() : Promise.resolve([]),
      dataSourceType === "zoning" ? fetchZoningTypes() : Promise.resolve([]),
      fetchWeather(),
      fetchExistingPosts(),
    ]);

    console.log(
      `Data source: ${dataSourceType}, weather: ${weather ? "yes" : "no"}, ${existingPosts.length} existing posts`
    );

    // 3. Generate blog posts with Claude
    const anthropic = new Anthropic();
    const prompt = buildPrompt({
      type: dataSourceType,
      permits,
      energy,
      landmarks,
      zoning,
      weather,
      existingPosts,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response (strip markdown code blocks if present)
    let jsonText = content.text.trim();
    // Remove markdown code blocks
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    let generated: GeneratedPosts;
    try {
      generated = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Claude response. Raw text:", content.text.slice(0, 500));
      console.error("Cleaned text:", jsonText.slice(0, 500));
      console.error("Parse error:", parseError);
      throw new Error("Invalid JSON response from Claude");
    }

    if (!generated.posts || !Array.isArray(generated.posts)) {
      throw new Error("Invalid response structure - expected posts array");
    }

    // 4. Create drafts in Sanity
    const dataSources: string[] = ["Chicago Data Portal"];
    const dataSourceLabels: Record<DataSourceType, string> = {
      permits: "Building Permits",
      energy: "Energy Benchmarking",
      landmarks: "Historic Landmarks",
      zoning: "Zoning Districts",
    };
    dataSources.push(dataSourceLabels[dataSourceType]);
    if (weather) dataSources.push("OpenWeatherMap");

    const createdDocs: Array<{ id: string; title: string }> = [];
    const now = new Date();

    for (let i = 0; i < generated.posts.length; i++) {
      const post = generated.posts[i];

      if (!post.title || !post.body) {
        console.warn(`Skipping post ${i} - missing title or body`);
        continue;
      }

      // Create as draft (no publishedAt) - editor reviews and publishes manually
      const doc = await sanityWriteClient.create({
        _type: "blogPost",
        title: post.title,
        slug: { _type: "slug", current: slugify(post.title) },
        author: "Dave Adams",
        excerpt: post.excerpt,
        body: markdownToPortableText(post.body),
        categories: post.categories,
        serviceType: post.serviceType || null,
        seo: post.seo,
        faq: post.faq?.map((item, idx) => ({
          _key: `faq-${idx}`,
          question: item.question,
          answer: item.answer,
        })),
        dataSources,
        generatedAt: now.toISOString(),
      });

      createdDocs.push({ id: doc._id, title: post.title });
      console.log(`Created blog draft: ${doc._id} - ${post.title}`);
    }

    return NextResponse.json({
      success: true,
      count: createdDocs.length,
      posts: createdDocs,
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
