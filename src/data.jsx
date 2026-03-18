import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchProjects,
  fetchTestimonials,
  fetchLocations,
  fetchSiteSettings,
  fetchAboutContent,
  fetchHero,
} from "../sanity";

// --- CMS DATA CONTEXT --------------------------------------------------------
const CMSContext = createContext(null);

const FALLBACK = {
  siteSettings: {
    companyName: "Homescape Construction Inc",
    tagline: "Building dreams from the ground up",
    phone: "",
    email: "",
    social: {},
    servingSince: ""
  },
  aboutContent: null,
  hero: null,
  projects: [],
  testimonials: [],
  locations: [],
};

export function CMSProvider({ children }) {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetchSiteSettings(),
      fetchProjects(),
      fetchTestimonials(),
      fetchLocations(),
      fetchAboutContent(),
      fetchHero(),
    ]).then(([siteSettings, projects, testimonials, locations, aboutContent, hero]) => {
      setData({
        siteSettings: siteSettings.value || FALLBACK.siteSettings,
        projects: projects.value || [],
        testimonials: testimonials.value || [],
        locations: locations.value || [],
        aboutContent: aboutContent.value || null,
        hero: hero.value || null,
      });
      if ([siteSettings, projects, testimonials, locations, aboutContent, hero].some(r => r.status === "rejected")) {
        console.error("Some CMS fetches failed:", { siteSettings, projects, testimonials, locations, aboutContent, hero });
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <CMSContext.Provider value={{ ...data, loading }}>
      {children}
    </CMSContext.Provider>
  );
}

export default function useCMS() {
  return useContext(CMSContext);
}
