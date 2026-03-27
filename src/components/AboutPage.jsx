import useCMS from "../data";
import { urlFor } from "../../sanity";

// Generate optimized image URL
const getImageUrl = (img, width = 800) => {
  if (!img?.asset) return null;
  return urlFor(img).width(width).quality(80).auto("format").url();
};

const getImageAlt = (img, fallback = "") => {
  return img?.alt || fallback;
};

const FALLBACK = {
  headline: "Craftsmanship meets innovation",
  story: "Founded in 2012, Homescape Construction Inc. began with a simple belief: that every structure we build should enhance the lives of those who use it.",
  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  values: [
    { title: "Quality First", description: "We never cut corners. Every joint, every finish, every detail meets our exacting standards." },
    { title: "Transparent Process", description: "Open communication and honest timelines — you'll always know where your project stands." },
    { title: "Sustainable Building", description: "We prioritize eco-friendly materials and energy-efficient construction methods." },
  ],
  stats: [
    { label: "Projects Completed", value: "200+" },
    { label: "Years of Experience", value: "13" },
    { label: "Client Satisfaction", value: "98%" },
  ],
  isFallback: true
};

export default function AboutPage() {
  const { aboutContent } = useCMS();
  const content = aboutContent || FALLBACK;

  return (
    <div className="page">
      <div className="container section">
        <div className="about-grid">
          <div>
            <div className="section-label animate-fade-up">About Us</div>
            <h2 className="section-title animate-fade-up animate-delay-1">{content.headline}</h2>
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
          {getImageUrl(content.image) ? (
            <img
              className="about-image animate-fade-in animate-delay-2"
              src={getImageUrl(content.image)}
              alt={getImageAlt(content.image, "Construction team at work")}
              loading="lazy"
            />
          ) : (
            <div className="about-image animate-fade-in animate-delay-2" style={{
              background: "var(--color-bg-alt)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-border)",
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
