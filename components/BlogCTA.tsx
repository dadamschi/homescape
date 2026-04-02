"use client";

import Link from "next/link";

// CTA copy variations - rotated automatically
const ctaVariations = [
  {
    headline: "Ready to Build?",
    subheadline: "Get a Free Consultation",
    body: "Contact Homescape Construction today for a free, no-obligation consultation. Tell us about your project and we'll provide a preliminary timeline and cost estimate within 48 hours.",
    buttonText: "Start Your Project",
  },
  {
    headline: "Planning a Renovation?",
    subheadline: "Let's Talk About Your Vision",
    body: "Whether it's a kitchen remodel, bathroom upgrade, or whole-home renovation, our team is ready to help. Schedule a free consultation and get expert guidance on your Chicago project.",
    buttonText: "Get Free Estimate",
  },
  {
    headline: "Transform Your Home",
    subheadline: "Chicago's Trusted Contractor Since 2012",
    body: "From concept to completion, Homescape Construction delivers quality craftsmanship on every project. Contact us today to discuss your renovation goals and receive a detailed estimate.",
    buttonText: "Request Consultation",
  },
  {
    headline: "Your Project Starts Here",
    subheadline: "Free Estimates • No Obligation",
    body: "Ready to take the next step? Our team will review your project requirements and provide a comprehensive estimate with timeline. Most quotes delivered within 48 hours.",
    buttonText: "Contact Us Today",
  },
  {
    headline: "Building Chicago Homes Since 2012",
    subheadline: "Quality You Can Trust",
    body: "Join hundreds of satisfied Chicago homeowners who chose Homescape Construction. Get started with a free consultation and see why our clients recommend us.",
    buttonText: "Schedule Consultation",
  },
  {
    headline: "Hire a Home Addition Contractor You Can Trust",
    subheadline: "A+ BBB Rating • 20+ Years Experience",
    body: "With 20+ years of experience, an A+ BBB rating, and a portfolio of successful additions across Chicago and the suburbs, Homescape Construction is the home addition contractor Chicagoland homeowners trust. Contact us today for a free estimate.",
    buttonText: "Get Free Estimate",
  },
  {
    headline: "Request a Free Quote",
    subheadline: "No Obligation • Detailed Proposal",
    body: "Contact us today to request your free, no-obligation remodeling quote. We'll schedule a site visit, discuss your goals, and deliver a detailed proposal within one week.",
    buttonText: "Request Quote",
  },
  {
    headline: "Get a Free Estimate",
    subheadline: "Chicago's Trusted Home Builder",
    body: "Ready to start your project in Chicago? Contact us for a free consultation. We'll visit your property, discuss your vision, and deliver a detailed proposal and timeline.",
    buttonText: "Contact Us",
  },
];

// Deterministic rotation based on current date (changes daily)
function getTodayVariation() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return ctaVariations[dayOfYear % ctaVariations.length];
}

export default function BlogCTA() {
  const variation = getTodayVariation();

  return (
    <aside className="blog-cta">
      <div className="blog-cta-content">
        <h2 className="blog-cta-headline">{variation.headline}</h2>
        <p className="blog-cta-subheadline">{variation.subheadline}</p>
        <p className="blog-cta-body">{variation.body}</p>
        <Link href="/contact" className="blog-cta-button">
          {variation.buttonText}
        </Link>
      </div>
    </aside>
  );
}
