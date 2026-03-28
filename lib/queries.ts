// GROQ queries for Sanity data fetching

export const queries = {
  projects: `*[_type == "project"] | order(year desc) {
    _id,
    title,
    category,
    description,
    image,
    images,
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

  aboutContent: `*[_type == "aboutContent"][0] {
    headline,
    story,
    image,
    values[] { title, description },
    stats[] { value, label }
  }`,

  siteSettings: `*[_type == "siteSettings"][0] {
    companyName,
    tagline,
    phone,
    email,
    social,
    servingSince
  }`,

  heroContent: `*[_type == "heroContent"][0] {
    headline,
    story,
    heroImages
  }`,
};
