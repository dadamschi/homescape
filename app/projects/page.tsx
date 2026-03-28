import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { Project } from "@/lib/types";
import ProjectsGrid from "@/components/ProjectsGrid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "View our portfolio of completed residential and commercial construction projects in the Chicago area. Custom homes, kitchen remodels, bathroom renovations, and commercial builds.",
  openGraph: {
    title: "Our Projects | Homescape Construction",
    description: "Portfolio of completed construction projects in Chicago",
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await sanityFetch<Project[]>(queries.projects);

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Portfolio</div>
        <h1 className="section-title animate-fade-up animate-delay-1">Our Projects</h1>
        <p className="section-subtitle animate-fade-up animate-delay-2">
          A selection of projects we&apos;ve brought to life.
        </p>
        <ProjectsGrid projects={projects} />
      </div>
    </div>
  );
}
