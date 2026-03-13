import useCMS from "../data";
import Icons from "../Icons";

export default function TestimonialsPage() {
  const { testimonials } = useCMS();

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Testimonials</div>
        <h2 className="section-title animate-fade-up animate-delay-1">What our clients say</h2>
        <p className="section-subtitle animate-fade-up animate-delay-2" style={{ marginBottom: "2.5rem" }}>
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
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">{t.name}</div>
              <div className="testimonial-project">{t.project}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
