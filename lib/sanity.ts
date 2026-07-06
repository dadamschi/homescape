import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImage } from "./types";

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

// Sanity client for data fetching
export const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: "2025-02-06",
});

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

// Type-safe data fetcher with Next.js cache integration
export async function sanityFetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  return sanityClient.fetch(query, params, {
    // Bypass CDN cache for fresher data, use Next.js caching instead
    cache: "no-store",
  });
}

// Preview client - needs token and no CDN for draft access
const previewClient = createClient({
  projectId: projectId!,
  dataset,
  apiVersion: "2025-02-06",
  useCdn: false,
  // Use read token, or fall back to write token (which also has read access)
  token: process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

// Preview-aware fetch for draft content (used with ?preview=true)
export async function sanityFetchPreview<T>(
  query: string,
  params?: Record<string, unknown>,
  preview = false
): Promise<T> {
  if (preview) {
    // Use preview client with drafts perspective
    return previewClient.fetch(query, params, {
      perspective: "previewDrafts",
    });
  }
  return sanityFetch<T>(query, params);
}

// Write client for mutations (server-only)
export const sanityWriteClient = createClient({
  projectId: projectId!,
  dataset,
  apiVersion: "2025-02-06",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});
