"use client";

import { urlFor } from "@/lib/sanity";
import type { Project, SanityImage } from "@/lib/types";
import ImageCarousel from "./ImageCarousel";

interface ProjectsGridProps {
  projects: Project[];
}

function getImageUrl(img: SanityImage, width = 800): string | null {
  if (!img?.asset) return null;
  return urlFor(img).width(width).quality(80).auto("format").url();
}

function getImageAlt(img: SanityImage, fallback = ""): string {
  return img?.alt || fallback;
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className="gallery-grid" style={{ marginTop: "2rem" }}>
      {projects.map((project, i) => (
        <div
          key={project._id}
          className="project-card"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div style={{ overflow: "hidden", position: "relative" }}>
            {(() => {
              const allImages = [project.image, ...(project.images || [])].filter(
                (img): img is SanityImage => Boolean(img?.asset)
              );

              if (allImages.length > 1) {
                return <ImageCarousel images={allImages} fallbackAlt={project.title} />;
              } else if (allImages.length === 1) {
                const url = getImageUrl(allImages[0]);
                const photoCredit = allImages[0].photoCredit;
                return url ? (
                  <>
                    <img
                      src={url}
                      alt={getImageAlt(allImages[0], project.title)}
                      loading="lazy"
                    />
                    {photoCredit && <PhotoCreditTag credit={photoCredit} />}
                  </>
                ) : (
                  <NoImagePlaceholder />
                );
              } else {
                return <NoImagePlaceholder />;
              }
            })()}
          </div>
          <div className="project-card-body">
            <div className="project-card-category">{project.category}</div>
            <div className="project-card-title">{project.title}</div>
            <div className="project-card-meta">
              {project.location} · {project.year}
            </div>
            {project.virtualTour && (
              <a
                href={project.virtualTour}
                target="_blank"
                rel="noopener noreferrer"
                className="virtual-tour-link"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                Virtual Tour
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoCreditTag({ credit }: { credit: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "8px",
        right: "8px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontSize: "0.65rem",
        padding: "4px 8px",
        borderRadius: "4px",
        letterSpacing: "0.02em",
        pointerEvents: "none",
      }}
    >
      {credit}
    </div>
  );
}

function NoImagePlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "240px",
        background: "var(--color-bg-alt)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        color: "var(--color-border)",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        No image yet
      </span>
    </div>
  );
}
