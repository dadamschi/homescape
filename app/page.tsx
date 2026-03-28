import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { HeroContent } from "@/lib/types";
import Hero from "@/components/Hero";

// Revalidate every hour for fresh content
export const revalidate = 3600;

export default async function HomePage() {
  const hero = await sanityFetch<HeroContent>(queries.heroContent);

  return (
    <div className="page">
      <Hero hero={hero} />
    </div>
  );
}
