import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sanityWriteClient } from "@/lib/sanity";

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

interface BlogContent {
  title: string;
  excerpt: string;
  body: string;
  category: "Chicago Trends" | "Seasonal Tips" | "Industry News" | "Home Improvement";
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

// Build the prompt for Claude
function buildPrompt(permits: ChicagoPermit[], weather: WeatherData | null): string {
  const permitsSection = permits.length > 0
    ? `## Recent Chicago Building Permits (last 10 issued)\n${JSON.stringify(permits.slice(0, 5), null, 2)}`
    : "No recent permit data available.";

  const weatherSection = weather
    ? `## Current Chicago Weather\nConditions: ${weather.weather[0]?.description || "N/A"}\nTemperature: ${Math.round(weather.main.temp)}°F (feels like ${Math.round(weather.main.feels_like)}°F)\nHumidity: ${weather.main.humidity}%`
    : "Weather data unavailable.";

  return `You are a content writer for Homescape Construction, a Chicago-based residential and commercial construction company serving Chicagoland since 2010.

Based on the following Chicago construction and weather data, write a blog post that would be valuable to homeowners considering construction or renovation projects.

${permitsSection}

${weatherSection}

Write a blog post and respond ONLY with valid JSON in this exact format (no markdown code blocks, just the JSON):
{
  "title": "An engaging, SEO-friendly title related to Chicago construction",
  "excerpt": "2-3 sentence summary that hooks the reader",
  "body": "Full article in markdown format (500-800 words). Use ## for section headings. Focus on practical advice.",
  "category": "Chicago Trends"
}

The category must be one of: "Chicago Trends", "Seasonal Tips", "Industry News", "Home Improvement"

Guidelines:
- Reference specific Chicago neighborhoods when relevant to permits data
- Include seasonal considerations based on weather
- Provide actionable advice for homeowners
- Mention Homescape Construction naturally where appropriate
- Use a professional but approachable tone
- Include statistics or trends when the data supports them`;
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

    // 2. Generate blog post with Claude
    const anthropic = new Anthropic();
    const prompt = buildPrompt(permits, weather);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    let blogData: BlogContent;
    try {
      blogData = JSON.parse(content.text);
    } catch {
      console.error("Failed to parse Claude response:", content.text);
      throw new Error("Invalid JSON response from Claude");
    }

    // Validate required fields
    if (!blogData.title || !blogData.body) {
      throw new Error("Missing required fields in blog content");
    }

    // 3. Create draft in Sanity
    const dataSources: string[] = [];
    if (permits.length > 0) dataSources.push("Chicago Data Portal");
    if (weather) dataSources.push("OpenWeatherMap");

    const doc = await sanityWriteClient.create({
      _type: "blogPost",
      title: blogData.title,
      slug: { _type: "slug", current: slugify(blogData.title) },
      excerpt: blogData.excerpt,
      body: markdownToPortableText(blogData.body),
      category: blogData.category,
      dataSources,
      generatedAt: new Date().toISOString(),
    });

    console.log(`Created blog draft: ${doc._id}`);

    return NextResponse.json({
      success: true,
      documentId: doc._id,
      title: blogData.title,
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
