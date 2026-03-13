import { useState } from "react";
import CMS_DATA from "../data";

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const categories = [
    "All",
    ...new Set(CMS_DATA.projects.map((p) => p.category)),
  ];
  const filtered =
    filter === "All"
      ? CMS_DATA.projects
      : CMS_DATA.projects.filter((p) => p.category === filter);

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Portfolio</div>
        <h2 className="section-title animate-fade-up animate-delay-1">
          Our Projects
        </h2>
        <p className="section-subtitle animate-fade-up animate-delay-2">
          A selection of residential, commercial, and renovation projects we've
          brought to life.
        </p>
        <div
          className="gallery-filters animate-fade-up animate-delay-3"
          style={{ marginTop: "2rem" }}
        >
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
                <img src={project.image} alt={project.title} loading="lazy" />
              </div>
              <div className="project-card-body">
                <div className="project-card-category">{project.category}</div>
                <div className="project-card-title">{project.title}</div>
                <div className="project-card-meta">
                  {project.location} · {project.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
