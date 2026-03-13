import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

// --- SANITY CLIENT -----------------------------------------------------------
// Update these values with your Sanity project details.
// You can find them at: https://www.sanity.io/manage
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "YOUR_PROJECT_ID",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  useCdn: true,
  apiVersion: "2025-02-06",
});

// --- IMAGE URL BUILDER -------------------------------------------------------
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source) {
  return builder.image(source);
}

// --- GROQ QUERIES ------------------------------------------------------------
export const queries = {
  projects: `*[_type == "project"] | order(year desc) {
    _id,
    title,
    category,
    description,
    "image": image.asset->url,
    year,
    location
  }`,

  testimonials: `*[_type == "testimonial"] {
    _id,
    name,
    project,
    quote,
    rating
  }`,

  locations: `*[_type == "location"] {
    _id,
    name,
    address,
    phone,
    hours
  }`,

  siteSettings: `*[_type == "siteSettings"][0] {
    companyName,
    tagline,
    phone,
    email,
    social
  }`,
};

// --- DATA FETCHERS -----------------------------------------------------------
// Use these to replace mock CMS_DATA with live Sanity content.
//
// Example usage in a component:
//   import { fetchProjects } from './sanity'
//   useEffect(() => { fetchProjects().then(setProjects) }, [])

export async function fetchProjects() {
  return sanityClient.fetch(queries.projects);
}

export async function fetchTestimonials() {
  return sanityClient.fetch(queries.testimonials);
}

export async function fetchLocations() {
  return sanityClient.fetch(queries.locations);
}

export async function fetchSiteSettings() {
  return sanityClient.fetch(queries.siteSettings);
}
