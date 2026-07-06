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
    location,
    virtualTour
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

  blogPosts: `*[_type == "blogPost" && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    publishedAt,
    excerpt,
    mainImage,
    categories
  }`,

  blogPostBySlug: `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    slug,
    author,
    publishedAt,
    excerpt,
    mainImage,
    body,
    categories,
    serviceType,
    seo,
    faq,
    dataSources
  }`,

  allBlogSlugs: `*[_type == "blogPost" && defined(publishedAt)].slug.current`,

  // Service pages
  servicePages: `*[_type == "servicePage" && isPublished == true] | order(order asc) {
    _id,
    title,
    slug,
    heroHeadline,
    heroImage,
    seo
  }`,

  servicePageBySlug: `*[_type == "servicePage" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    heroHeadline,
    heroSubheadline,
    heroImage,
    overview,
    process,
    costRange,
    timeline,
    chicagoConsiderations,
    faq,
    relatedProjects[]-> {
      _id,
      title,
      category,
      image,
      year
    },
    seo,
    isPublished
  }`,

  allServiceSlugs: `*[_type == "servicePage" && isPublished == true].slug.current`,
};
