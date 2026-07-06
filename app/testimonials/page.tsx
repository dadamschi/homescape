import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { Testimonial } from "@/lib/types";
import Icons from "@/components/Icons";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read what our clients say about Homescape Construction. Real feedback from homeowners and businesses who trusted us with their construction projects in Chicago.",
  openGraph: {
    title: "Client Testimonials | Homescape Construction",
    description: "Real feedback from our satisfied construction clients",
  },
  alternates: {
    canonical: "https://homescapeconstruction.com/testimonials",
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function TestimonialsPage() {
  const testimonials = await sanityFetch<Testimonial[]>(queries.testimonials);

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Testimonials</div>
        <h1 className="section-title animate-fade-up animate-delay-1">What our clients say</h1>
        <p
          className="section-subtitle animate-fade-up animate-delay-2"
          style={{ marginBottom: "2.5rem" }}
        >
          Real feedback from homeowners and businesses who trusted us with their vision.
        </p>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t._id}
              className="testimonial-card animate-fade-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j}>{Icons.star}</span>
                ))}
              </div>
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author">{t.name}</div>
              <div className="testimonial-project">{t.project}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
