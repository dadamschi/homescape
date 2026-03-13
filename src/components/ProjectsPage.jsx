import { useState } from "react";
import useCMS from "../data";

export default function ProjectsPage() {
  const { projects } = useCMS();
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Portfolio</div>
        <h2 className="section-title animate-fade-up animate-delay-1">Our Projects</h2>
        <p className="section-subtitle animate-fade-up animate-delay-2">
          A selection of residential, commercial, and renovation projects we've brought to life.
        </p>
        <div className="gallery-filters animate-fade-up animate-delay-3" style={{ marginTop: "2rem" }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-btn ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {filtered.map((project, i) => (
            <div
              key={project._id}
              className="project-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ overflow: "hidden" }}>
                {project.image ? (
                  <img src={project.image} alt={project.title} loading="lazy" />
                ) : (
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
                )}
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
