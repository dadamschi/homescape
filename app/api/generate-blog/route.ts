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

interface BlogPost {
  title: string;
  excerpt: string;
  body: string;
  category: "Chicago Trends" | "Seasonal Tips" | "Industry News" | "Home Improvement";
}

interface GeneratedPosts {
  posts: BlogPost[];
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

// Convert markdown to Portable Text blocks
function markdownToPortableText(markdown: string) {
  const blocks: Array<{
    _type: "block";
    _key: string;
    style: string;
    children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }>;
    markDefs: Array<unknown>;
  }> = [];

  const lines = markdown.split("\n");
  let keyCounter = 0;

  const generateKey = () => `block-${keyCounter++}`;

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

    blocks.push({
      _type: "block",
      _key: generateKey(),
      style,
      children: [
        {
          _type: "span",
          _key: generateKey(),
          text,
          marks: [],
        },
      ],
      markDefs: [],
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
function buildPrompt(permits: ChicagoPermit[], weather: WeatherData | null): string {
  const permitsSection = permits.length > 0
    ? `## Recent Chicago Building Permits\n${JSON.stringify(permits.slice(0, 8), null, 2)}`
    : "No recent permit data available.";

  const weatherSection = weather
    ? `## Current Chicago Weather\nConditions: ${weather.weather[0]?.description || "N/A"}\nTemperature: ${Math.round(weather.main.temp)}°F (feels like ${Math.round(weather.main.feels_like)}°F)\nHumidity: ${weather.main.humidity}%`
    : "Weather data unavailable.";

  return `You are a content writer for Homescape Construction. Follow the guidelines below exactly.

---

# CONTENT GUIDELINES

${CONTENT_GUIDELINES}

---

# CURRENT DATA

Use this real-time data to inform your posts:

${permitsSection}

${weatherSection}

---

# YOUR TASK

Generate 2-3 separate blog posts based on the data above. Each should be focused on a SINGLE topic:
- One post about a specific neighborhood or permit trend (if permit data available)
- One post with seasonal/weather-related construction tips (if weather data available)
- One post with practical homeowner advice

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
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "SANITY_WRITE_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch Chicago data in parallel
    const [permits, weather] = await Promise.all([
      fetchChicagoPermits(),
      fetchWeather(),
    ]);

    console.log(`Fetched ${permits.length} permits, weather: ${weather ? "yes" : "no"}`);

    // 2. Generate blog posts with Claude
    const anthropic = new Anthropic();
    const prompt = buildPrompt(permits, weather);

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

      // Stagger publishedAt by a few hours for each post
      const publishedAt = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);

      const doc = await sanityWriteClient.create({
        _type: "blogPost",
        title: post.title,
        slug: { _type: "slug", current: slugify(post.title) },
        excerpt: post.excerpt,
        body: markdownToPortableText(post.body),
        category: post.category,
        publishedAt: publishedAt.toISOString(),
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
