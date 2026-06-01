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

// Build the prompt for Claude - generates multiple focused posts
function buildPrompt(
  permits: ChicagoPermit[],
  weather: WeatherData | null,
  existingPosts: ExistingPost[]
): string {
  const permitsSection =
    permits.length > 0
      ? `## Recent Chicago Building Permits\n${JSON.stringify(permits.slice(0, 8), null, 2)}`
      : "No recent permit data available.";

  const weatherSection = weather
    ? `## Current Chicago Weather\nConditions: ${weather.weather[0]?.description || "N/A"}\nTemperature: ${Math.round(weather.main.temp)}°F (feels like ${Math.round(weather.main.feels_like)}°F)\nHumidity: ${weather.main.humidity}%`
    : "Weather data unavailable.";

  const existingPostsSection =
    existingPosts.length > 0
      ? `## Existing Blog Posts (for internal linking)\nLink to relevant posts using markdown format: [anchor text](/blog/slug)\n\n${existingPosts.map((p) => `- "${p.title}" (/blog/${p.slug}) - ${p.categories?.join(", ") || "General"}`).join("\n")}`
      : "No existing posts available for linking.";

  return `You are a content writer for Homescape Construction. Follow the guidelines below exactly.

---

# CONTENT GUIDELINES

${CONTENT_GUIDELINES}

---

# SEO KEYWORD TARGETING

${SEO_KEYWORDS}

---

# CURRENT DATA

Use this real-time data to inform your posts:

${permitsSection}

${weatherSection}

${existingPostsSection}

---

# YOUR TASK

Generate ONE high-quality blog post (NOT thin content). The post MUST:
- Meet the word count minimums: 700-1,200 words for evergreen/service posts, 500-800 for permit-data posts
- Include a lead answer (40-60 words) directly under the title
- Have at least one H2 phrased as a natural question
- Include an FAQ section with 3-5 Q&As (40-60 words each answer)
- End with a single soft CTA

Topic priority (pick ONE based on available data):
1. SERVICE post about a common remodeling topic (kitchen, bathroom, basement, additions) - HIGHEST priority
2. PERMIT-DATA post with specific real permit numbers from the data above
3. SEASONAL post tied to Chicago weather conditions

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
    // 1. Fetch Chicago data and existing posts in parallel
    const [permits, weather, existingPosts] = await Promise.all([
      fetchChicagoPermits(),
      fetchWeather(),
      fetchExistingPosts(),
    ]);

    console.log(
      `Fetched ${permits.length} permits, weather: ${weather ? "yes" : "no"}, ${existingPosts.length} existing posts`
    );

    // 2. Generate blog posts with Claude
    const anthropic = new Anthropic();
    const prompt = buildPrompt(permits, weather, existingPosts);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    let generated: GeneratedPosts;
    try {
      generated = JSON.parse(content.text);
    } catch {
      console.error("Failed to parse Claude response:", content.text);
      throw new Error("Invalid JSON response from Claude");
    }

    if (!generated.posts || !Array.isArray(generated.posts)) {
      throw new Error("Invalid response structure - expected posts array");
    }

    // 3. Create drafts in Sanity
    const dataSources: string[] = [];
    if (permits.length > 0) dataSources.push("Chicago Data Portal");
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
