import type { Metadata } from "next";
import { sanityFetch, urlFor } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { AboutContent, SanityImage, HeroContent } from "@/lib/types";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Homescape Construction Inc., a Chicago-based construction company founded in 2012. Over 200 projects completed with 98% client satisfaction. Quality craftsmanship and transparent communication.",
  openGraph: {
    title: "About Homescape Construction",
    description: "Chicago construction company since 2012 - 200+ projects, 98% satisfaction",
  },
  alternates: {
    canonical: "https://homescapeconstruction.com/about",
  },
};

// Revalidate every hour
export const revalidate = 3600;

const FALLBACK = {
  headline: "Craftsmanship meets innovation",
  story:
    "Founded in 2012, Homescape Construction Inc. began with a simple belief: that every structure we build should enhance the lives of those who use it.",
  values: [
    {
      title: "Quality First",
      description:
        "We never cut corners. Every joint, every finish, every detail meets our exacting standards.",
    },
    {
      title: "Transparent Process",
      description:
        "Open communication and honest timelines — you'll always know where your project stands.",
    },
    {
      title: "Sustainable Building",
      description:
        "We prioritize eco-friendly materials and energy-efficient construction methods.",
    },
  ],
  stats: [
    { label: "Projects Completed", value: "200+" },
    { label: "Years of Experience", value: "13" },
    { label: "Client Satisfaction", value: "98%" },
  ],
};

function getImageUrl(img: SanityImage | undefined, width = 800): string | null {
  if (!img?.asset) return null;
  return urlFor(img).width(width).quality(80).auto("format").url();
}

function getImageAlt(img: SanityImage | undefined, fallback = ""): string {
  return img?.alt || fallback;
}

export default async function AboutPage() {
  const [aboutContent, heroContent] = await Promise.all([
    sanityFetch<AboutContent | null>(queries.aboutContent),
    sanityFetch<HeroContent | null>(queries.heroContent),
  ]);
  const content = aboutContent || FALLBACK;

  // Use about image, or fall back to first hero image
  const aboutImage = aboutContent?.image;
  const fallbackImage = heroContent?.heroImages?.[0];
  const imageUrl = getImageUrl(aboutImage) || getImageUrl(fallbackImage);

  return (
    <div className="page">
      <div className="container section">
        <div className="about-grid">
          <div>
            <div className="section-label animate-fade-up">About Us</div>
            <h1 className="section-title animate-fade-up animate-delay-1">{content.headline}</h1>
            <p className="about-story animate-fade-up animate-delay-2">{content.story}</p>
            <div className="values-list animate-fade-up animate-delay-3">
              {content.values?.map((v, i) => (
                <div key={i}>
                  <div className="value-item-title">{v.title}</div>
                  <div className="value-item-desc">{v.description}</div>
                </div>
              ))}
            </div>
            <div className="stats-row animate-fade-up animate-delay-4">
              {content.stats?.map((s, i) => (
                <div key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {imageUrl ? (
            <img
              className="about-image animate-fade-in animate-delay-2"
              src={imageUrl}
              alt={getImageAlt(aboutImage, getImageAlt(fallbackImage, "Construction team at work"))}
              loading="lazy"
            />
          ) : (
            <div
              className="about-image animate-fade-in animate-delay-2"
              style={{
                background: "var(--color-bg-alt)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-border)",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
