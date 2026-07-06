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
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

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

// Block types for Portable Text
interface TextBlock {
  _type: "block";
  _key: string;
  style: string;
  children: Array<{ _type: "span"; _key: string; text: string; marks: string[] }>;
  markDefs: LinkMarkDef[];
}

interface TableBlock {
  _type: "table";
  _key: string;
  headers: string[];
  rows: string[][];
}

type PortableTextBlock = TextBlock | TableBlock;

// Convert markdown to Portable Text blocks with link and table support
function markdownToPortableText(markdown: string): PortableTextBlock[] {
  const blocks: PortableTextBlock[] = [];
  const lines = markdown.split("\n");
  let keyCounter = 0;
  let i = 0;

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

  // Parse a table row into cells
  function parseTableRow(line: string): string[] {
    return line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1); // Remove empty first/last from | borders
  }

  // Check if a line is a table separator (|---|---|...)
  function isTableSeparator(line: string): boolean {
    return /^\|[\s-:|]+\|$/.test(line.trim());
  }

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Check if this is a table (starts with |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];

      // Collect all consecutive table lines
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      // Parse table if we have at least header + separator + 1 row
      if (tableLines.length >= 3 && isTableSeparator(tableLines[1])) {
        const headers = parseTableRow(tableLines[0]);
        const rows: string[][] = [];

        for (let j = 2; j < tableLines.length; j++) {
          if (!isTableSeparator(tableLines[j])) {
            rows.push(parseTableRow(tableLines[j]));
          }
        }

        blocks.push({
          _type: "table",
          _key: generateKey(),
          headers,
          rows,
        });
      }
      continue;
    }

    // Handle headings and regular text
    let style = "normal";
    let text = trimmed;

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

    i++;
  }

  return blocks;
}

// Send Slack notification for draft review
async function sendSlackNotification(draft: {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  dataSource: string;
  qualityScore: number;
  wordCount: number;
}): Promise<void> {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    console.log("Slack not configured, skipping notification");
    return;
  }

  const studioUrl = `https://homescapeconstruction.sanity.studio/structure/blogPost;${draft.id}`;
  const previewUrl = `https://homescapeconstruction.com/blog/${draft.slug}`;

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "📝 New Blog Draft Ready for Review",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${draft.title}*\n\n${draft.excerpt}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📊 Data: *${draft.dataSource}* | 🎯 Quality: *${draft.qualityScore}/100* | 📝 Words: *${draft.wordCount}*`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🔗 <${studioUrl}|Edit in Studio> | <${previewUrl}|Preview>`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✅ Approve & Publish",
            emoji: true,
          },
          style: "primary",
          action_id: "approve_post",
          value: draft.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "❌ Reject",
            emoji: true,
          },
          style: "danger",
          action_id: "reject_post",
          value: draft.id,
        },
      ],
    },
  ];

  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL_ID,
        blocks,
        text: `New blog draft: ${draft.title}`, // Fallback text
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error("Slack API error:", result.error);
    } else {
      console.log("Slack notification sent for:", draft.title);
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

// Generate URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// MULTI-PASS GENERATION SYSTEM
// ============================================================================

// Slop phrases to check for in quality review
const SLOP_PHRASES = [
  "in today's market",
  "in today's fast-paced world",
  "when it comes to",
  "look no further",
  "nestled in the heart of",
  "whether you're a",
  "we've got you covered",
  "elevate your space",
  "transform your dreams",
  "top-notch",
  "state-of-the-art",
  "second to none",
  "our team of experts",
  "don't hesitate to",
  "contact us today",
  "without further ado",
  "it's important to note",
  "in conclusion",
  "at the end of the day",
  "game-changer",
  "seamless",
  "leverage",
  "synergy",
];

// Content quality metrics
interface ContentScore {
  wordCount: number;
  hasLeadAnswer: boolean;
  questionHeadingCount: number;
  faqCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  slopPhraseCount: number;
  slopPhrasesFound: string[];
  passesMinimums: boolean;
  overallScore: number; // 0-100
}

// Score the generated content
function scoreContent(post: BlogPost): ContentScore {
  const body = post.body || "";
  const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;

  // Check for lead answer (first paragraph should be substantial)
  const firstParagraph = body.split("\n\n")[0] || "";
  const firstParaWords = firstParagraph.split(/\s+/).filter((w) => w.length > 0).length;
  const hasLeadAnswer = firstParaWords >= 30 && firstParaWords <= 80;

  // Count question headings
  const headingMatches = body.match(/^##\s+.*\?/gm) || [];
  const questionHeadingCount = headingMatches.length;

  // Count FAQs
  const faqCount = post.faq?.length || 0;

  // Count internal links (/blog/)
  const internalLinkMatches = body.match(/\]\(\/blog\//g) || [];
  const internalLinkCount = internalLinkMatches.length;

  // Count external links (http)
  const externalLinkMatches = body.match(/\]\(https?:\/\//g) || [];
  const externalLinkCount = externalLinkMatches.length;

  // Check for slop phrases
  const bodyLower = body.toLowerCase();
  const slopPhrasesFound = SLOP_PHRASES.filter((phrase) =>
    bodyLower.includes(phrase.toLowerCase())
  );
  const slopPhraseCount = slopPhrasesFound.length;

  // Calculate if minimums are met
  const passesMinimums =
    wordCount >= 500 &&
    hasLeadAnswer &&
    questionHeadingCount >= 1 &&
    faqCount >= 3 &&
    externalLinkCount >= 1 &&
    slopPhraseCount === 0;

  // Calculate overall score (0-100)
  let score = 0;
  score += Math.min(30, (wordCount / 800) * 30); // Up to 30 points for word count
  score += hasLeadAnswer ? 15 : 0;
  score += Math.min(10, questionHeadingCount * 5); // Up to 10 points
  score += Math.min(15, faqCount * 3); // Up to 15 points
  score += Math.min(10, internalLinkCount * 5); // Up to 10 points
  score += Math.min(10, externalLinkCount * 5); // Up to 10 points
  score -= slopPhraseCount * 5; // Deduct for slop phrases
  score = Math.max(0, Math.min(100, score));

  return {
    wordCount,
    hasLeadAnswer,
    questionHeadingCount,
    faqCount,
    internalLinkCount,
    externalLinkCount,
    slopPhraseCount,
    slopPhrasesFound,
    passesMinimums,
    overallScore: Math.round(score),
  };
}

// Outline structure from Pass 1
interface BlogOutline {
  title: string;
  targetKeyword: string;
  leadAnswerSummary: string;
  sections: Array<{
    heading: string;
    keyPoints: string[];
    isQuestion: boolean;
  }>;
  faqTopics: string[];
  internalLinksToInclude: string[];
  externalSourcesToUse: string[];
}

interface OutlineResponse {
  outline: BlogOutline;
}

// Pass 1: Generate outline only
async function generateOutline(
  anthropic: Anthropic,
  ctx: DataContext,
  topicGuidance: string,
  primaryDataSection: string
): Promise<BlogOutline> {
  const existingPostsList =
    ctx.existingPosts.length > 0
      ? ctx.existingPosts.map((p) => `- "${p.title}" (/blog/${p.slug})`).join("\n")
      : "No existing posts yet.";

  const outlinePrompt = `You are planning a blog post for Homescape Construction, a Chicago contractor.

## DATA CONTEXT
${primaryDataSection}

## TOPIC FOCUS
${topicGuidance}

## EXISTING POSTS FOR LINKING
${existingPostsList}

## YOUR TASK
Create a detailed OUTLINE for ONE blog post. Do NOT write the content yet - just the structure.

The outline must include:
1. A specific, SEO-friendly title (under 60 chars)
2. The primary keyword to target
3. A brief summary of what the lead answer will cover (the first 40-60 words)
4. 4-6 section headings with key points for each. At least ONE heading must be a question.
5. 3-5 FAQ topics (just the questions, not answers yet)
6. Which existing posts to link to (1-2)
7. Which external sources to cite (Chicago Building Dept, EPA, ENERGY STAR, etc.)

Respond with valid JSON only:
{
  "outline": {
    "title": "string",
    "targetKeyword": "string",
    "leadAnswerSummary": "string",
    "sections": [
      { "heading": "string", "keyPoints": ["string"], "isQuestion": boolean }
    ],
    "faqTopics": ["string"],
    "internalLinksToInclude": ["/blog/slug"],
    "externalSourcesToUse": ["https://url"]
  }
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: outlinePrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude in outline generation");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  const parsed: OutlineResponse = JSON.parse(jsonText);
  return parsed.outline;
}

// Pass 2: Expand outline into full content
async function expandOutline(
  anthropic: Anthropic,
  outline: BlogOutline,
  ctx: DataContext,
  primaryDataSection: string
): Promise<BlogPost> {
  const expandPrompt = `You are writing a blog post for Homescape Construction based on this approved outline.

## CONTENT GUIDELINES (follow exactly)
${CONTENT_GUIDELINES}

## SEO KEYWORDS
${SEO_KEYWORDS}

## DATA TO REFERENCE
${primaryDataSection}

${ctx.weather ? `Current weather: ${ctx.weather.weather[0]?.description}, ${Math.round(ctx.weather.main.temp)}°F` : ""}

## APPROVED OUTLINE
Title: ${outline.title}
Target Keyword: ${outline.targetKeyword}
Lead Answer Summary: ${outline.leadAnswerSummary}

Sections:
${outline.sections.map((s) => `- ${s.heading}${s.isQuestion ? " (QUESTION)" : ""}\n  Key points: ${s.keyPoints.join("; ")}`).join("\n")}

FAQ Topics to Answer:
${outline.faqTopics.map((q) => `- ${q}`).join("\n")}

Internal Links to Include: ${outline.internalLinksToInclude.join(", ")}
External Sources to Cite: ${outline.externalSourcesToUse.join(", ")}

## YOUR TASK
Write the FULL blog post following the outline above. Requirements:
- Lead answer: 40-60 words, directly answers the title's question
- Body: 700-1,200 words total, expand each section thoroughly
- FAQ section: Write 40-60 word answers for each FAQ topic
- Include all specified internal and external links naturally
- NO slop phrases (see guidelines)
- End with ONE soft CTA

Respond with valid JSON only (no markdown blocks):
{
  "posts": [{
    "title": "string",
    "excerpt": "string (max 160 chars)",
    "body": "full markdown content",
    "categories": ["string"],
    "serviceType": "string or null",
    "seo": { "metaTitle": "string (50-70 chars total)", "metaDescription": "string (max 160 chars)" },
    "faq": [{ "question": "string", "answer": "string" }]
  }]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: expandPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude in content expansion");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  const parsed: GeneratedPosts = JSON.parse(jsonText);
  if (!parsed.posts?.[0]) {
    throw new Error("No post generated in expansion pass");
  }

  return parsed.posts[0];
}

// Pass 3: Quality review and improvement
async function reviewAndImprove(
  anthropic: Anthropic,
  post: BlogPost,
  score: ContentScore
): Promise<BlogPost> {
  // If score is good enough, skip the review pass
  if (score.overallScore >= 80 && score.slopPhraseCount === 0) {
    console.log(`Quality score ${score.overallScore}/100 - skipping review pass`);
    return post;
  }

  console.log(
    `Quality score ${score.overallScore}/100, slop phrases: ${score.slopPhrasesFound.join(", ")} - running review pass`
  );

  const reviewPrompt = `You are a senior editor reviewing a blog post for Homescape Construction.

## QUALITY ISSUES FOUND
- Word count: ${score.wordCount} (target: 700-1,200)
- Lead answer present: ${score.hasLeadAnswer ? "Yes" : "NO - NEEDS FIXING"}
- Question headings: ${score.questionHeadingCount} (need at least 1)
- FAQ count: ${score.faqCount} (need at least 3)
- Internal links: ${score.internalLinkCount} (need 1-2)
- External links: ${score.externalLinkCount} (need at least 1)
- Slop phrases found: ${score.slopPhrasesFound.length > 0 ? score.slopPhrasesFound.join(", ") : "None"}

## SLOP PHRASES TO REMOVE (if present)
${SLOP_PHRASES.join(", ")}

## CURRENT POST
Title: ${post.title}
Excerpt: ${post.excerpt}

Body:
${post.body}

FAQ:
${post.faq?.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

## YOUR TASK
Improve this post by:
1. Removing any slop phrases - replace with direct, specific language
2. Ensuring the lead answer is 40-60 words and directly answers the title
3. Adding a question-phrased H2 if missing
4. Expanding content if under 700 words
5. Adding missing links if needed

Return the IMPROVED post as valid JSON (same structure as input):
{
  "posts": [{
    "title": "string",
    "excerpt": "string",
    "body": "string",
    "categories": ["string"],
    "serviceType": "string or null",
    "seo": { "metaTitle": "string", "metaDescription": "string" },
    "faq": [{ "question": "string", "answer": "string" }]
  }]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: reviewPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude in review pass");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  const parsed: GeneratedPosts = JSON.parse(jsonText);
  if (!parsed.posts?.[0]) {
    console.warn("Review pass returned no post, using original");
    return post;
  }

  return parsed.posts[0];
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

    // 3. Build context for multi-pass generation
    const ctx: DataContext = {
      type: dataSourceType,
      permits,
      energy,
      landmarks,
      zoning,
      weather,
      existingPosts,
    };

    // Build primary data section and topic guidance (extracted from buildPrompt)
    let primaryDataSection = "";
    let topicGuidance = "";

    switch (dataSourceType) {
      case "permits":
        primaryDataSection =
          permits.length > 0
            ? `## This Week's Focus: Recent Chicago Building Permits\n${JSON.stringify(permits.slice(0, 8), null, 2)}`
            : "No recent permit data available.";
        topicGuidance = `Write about PERMITS and COSTS. Use the real permit data above to discuss:
- What specific permit costs tell homeowners about project pricing
- Permit processing times and what to expect
- Work types and scope from real permits`;
        break;

      case "energy":
        primaryDataSection =
          energy.length > 0
            ? `## This Week's Focus: Chicago Energy Benchmarking Data\n${JSON.stringify(energy.slice(0, 10), null, 2)}`
            : "No energy benchmarking data available.";
        topicGuidance = `Write about ENERGY EFFICIENCY. Use the benchmarking data to discuss:
- How building size affects energy costs in Chicago
- Chicago Energy Rating and what it means for homeowners
- Energy upgrades that improve ratings (insulation, windows, HVAC)`;
        break;

      case "landmarks":
        primaryDataSection =
          landmarks.length > 0
            ? `## This Week's Focus: Chicago Landmarks\n${JSON.stringify(landmarks.slice(0, 10), null, 2)}`
            : "No landmarks data available.";
        topicGuidance = `Write about HISTORIC RENOVATION. Use the landmarks data to discuss:
- Renovating in Chicago's landmark districts
- Permit and approval requirements for historic properties
- Balancing preservation with modern updates
- Working with the Chicago Landmarks Commission`;
        break;

      case "zoning":
        primaryDataSection =
          zoning.length > 0
            ? `## This Week's Focus: Chicago Zoning Districts\nCommon zone classes: ${zoning
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

    const anthropic = new Anthropic();

    // ============================================================================
    // MULTI-PASS GENERATION
    // ============================================================================

    console.log("=== PASS 1: Generating outline ===");
    const outline = await generateOutline(anthropic, ctx, topicGuidance, primaryDataSection);
    console.log(`Outline generated: "${outline.title}" with ${outline.sections.length} sections`);

    console.log("=== PASS 2: Expanding content ===");
    let post = await expandOutline(anthropic, outline, ctx, primaryDataSection);
    console.log(`Content expanded: ${post.body?.split(/\s+/).length || 0} words`);

    // Score the content
    let score = scoreContent(post);
    console.log(`Initial quality score: ${score.overallScore}/100`);
    if (score.slopPhrasesFound.length > 0) {
      console.log(`Slop phrases found: ${score.slopPhrasesFound.join(", ")}`);
    }

    console.log("=== PASS 3: Quality review ===");
    post = await reviewAndImprove(anthropic, post, score);

    // Re-score after review
    const finalScore = scoreContent(post);
    console.log(`Final quality score: ${finalScore.overallScore}/100`);

    const generated: GeneratedPosts = { posts: [post] };

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
      // Add timestamp to slug to avoid duplicates
      const timestamp = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const slugWithDate = `${slugify(post.title)}-${timestamp}`;

      // Get quality score for this post
      const postScore = scoreContent(post);

      const doc = await sanityWriteClient.create({
        _type: "blogPost",
        title: post.title,
        slug: { _type: "slug", current: slugWithDate },
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
        // Quality metadata from multi-pass generation
        qualityScore: postScore.overallScore,
        wordCount: postScore.wordCount,
      });

      createdDocs.push({ id: doc._id, title: post.title });
      console.log(`Created blog draft: ${doc._id} - ${post.title}`);

      // Send Slack notification for review
      await sendSlackNotification({
        id: doc._id,
        title: post.title,
        excerpt: post.excerpt,
        slug: slugWithDate,
        dataSource: dataSourceLabels[dataSourceType],
        qualityScore: postScore.overallScore,
        wordCount: postScore.wordCount,
      });
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
