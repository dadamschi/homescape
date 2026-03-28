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

// Type-safe data fetcher
export async function sanityFetch<T>(query: string): Promise<T> {
  return sanityClient.fetch(query);
}
