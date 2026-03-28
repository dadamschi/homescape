import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import type { HeroContent, SanityImage } from "@/lib/types";
import Icons from "./Icons";

interface HeroProps {
  hero: HeroContent;
}

// Get a random hero image (deterministic on server, random on each request)
function getRandomHeroImage(images: SanityImage[]): SanityImage | null {
  if (!images || images.length === 0) return null;
  const index = Math.floor(Math.random() * images.length);
  return images[index];
}

export default function Hero({ hero }: HeroProps) {
  if (!hero) return null;

  const heroImage = getRandomHeroImage(hero.heroImages || []);

  const bgStyle = heroImage
    ? { backgroundImage: `url(${urlFor(heroImage).width(1920).quality(80).auto("format").url()})` }
    : undefined;

  return (
    <section className="hero">
      <div className="hero-bg" style={bgStyle} />
      <div className="hero-content">
        <h1 className="animate-fade-up animate-delay-1">{hero.headline}</h1>
        <p className="animate-fade-up animate-delay-2">{hero.story}</p>
        <div className="hero-buttons animate-fade-up animate-delay-3">
          <Link href="/projects" className="btn btn-primary">
            View Our Work {Icons.arrow}
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Start Your Project
          </Link>
        </div>
      </div>
    </section>
  );
}
