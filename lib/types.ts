// Sanity document types

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  photoCredit?: string;
  [key: string]: unknown;
}

export interface Project {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: SanityImage;
  images: SanityImage[];
  year: number;
  location: string;
  virtualTour?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  project: string;
  quote: string;
  rating: number;
}

export interface Location {
  _id: string;
  name: string;
  address: string;
  hours: string;
}

export interface Value {
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface AboutContent {
  headline: string;
  story: string;
  image: SanityImage;
  values: Value[];
  stats: Stat[];
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  social: SocialLinks;
  servingSince: string;
}

export interface HeroContent {
  headline: string;
  story: string;
  heroImages: SanityImage[];
}

// Lead form data
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  source?: string;
}

// Blog post (Portable Text block type)
export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style?: string;
  children: Array<{
    _type: string;
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
}

// Table block type
export interface TableBlock {
  _type: "table";
  _key: string;
  headers: string[];
  rows: string[][];
}

// Combined block type for body content
export type BodyBlock = PortableTextBlock | TableBlock;

export interface BlogPostFAQ {
  question: string;
  answer: string;
}

export interface BlogPostSEO {
  metaTitle?: string;
  metaDescription?: string;
}

export type BlogCategory =
  | "Remodeling"
  | "Permits"
  | "Seasonal"
  | "Projects"
  | "Guides"
  | "Chicago Trends"
  | "Home Improvement";

export type BlogServiceType =
  | "Custom Home Building"
  | "Kitchen Remodeling"
  | "Bathroom Remodeling"
  | "Home Additions"
  | "Basement Finishing"
  | "ADU & Garage Conversions"
  | "General Contracting";

export interface BlogPost {
  _id: string;
  _type: "blogPost";
  _updatedAt?: string;
  title: string;
  slug: { current: string };
  author?: string;
  publishedAt?: string;
  excerpt?: string;
  mainImage?: SanityImage;
  body?: BodyBlock[];
  categories?: BlogCategory[];
  serviceType?: BlogServiceType;
  seo?: BlogPostSEO;
  faq?: BlogPostFAQ[];
  dataSources?: string[];
  generatedAt?: string;
}
