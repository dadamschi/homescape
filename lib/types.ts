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
  phone: string;
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
