import { useState } from "react";
import useCMS from "../data";

// Extract URL from image object or string
const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.url || null;
};

const getImageAlt = (img, fallback = "") => {
  if (!img) return fallback;
  if (typeof img === "string") return fallback;
  return img.alt || fallback;
};

function ImageCarousel({ images, fallbackAlt = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = images.filter((img) => getImageUrl(img));

  if (validImages.length === 0) return null;
  if (validImages.length === 1) {
    return <img src={getImageUrl(validImages[0])} alt={getImageAlt(validImages[0], fallbackAlt)} loading="lazy" />;
  }

  const prev = () => setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  const current = validImages[currentIndex];

  return (
    <div className="carousel">
      <img src={getImageUrl(current)} alt={getImageAlt(current, fallbackAlt)} loading="lazy" />
      <button className="carousel-btn carousel-btn-prev" onClick={prev}>‹</button>
      <button className="carousel-btn carousel-btn-next" onClick={next}>›</button>
      <div className="carousel-dots">
        {validImages.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects } = useCMS();

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Portfolio</div>
        <h2 className="section-title animate-fade-up animate-delay-1">Our Projects</h2>
        <p className="section-subtitle animate-fade-up animate-delay-2">
          A selection of residential, commercial, and renovation projects we've brought to life.
        </p>
        <div className="gallery-grid" style={{ marginTop: "2rem" }}>
          {projects.map((project, i) => (
            <div
              key={project._id}
              className="project-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ overflow: "hidden" }}>
                {(() => {
                  const allImages = [project.image, ...(project.images || [])].filter((img) => getImageUrl(img));
                  if (allImages.length > 1) {
                    return <ImageCarousel images={allImages} fallbackAlt={project.title} />;
                  } else if (allImages.length === 1) {
                    return <img src={getImageUrl(allImages[0])} alt={getImageAlt(allImages[0], project.title)} loading="lazy" />;
                  } else {
                    return (
                      <div style={{
                        width: "100%",
                        height: "240px",
                        background: "var(--color-bg-alt)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        color: "var(--color-border)",
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>No image yet</span>
                      </div>
                    );
                  }
                })()}
              </div>
              <div className="project-card-body">
                <div className="project-card-category">{project.category}</div>
                <div className="project-card-title">{project.title}</div>
                <div className="project-card-meta">{project.location} · {project.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
