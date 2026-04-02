import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { Location, SiteSettings } from "@/lib/types";
import Icons from "@/components/Icons";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Homescape Construction for your next project. Get a free consultation and estimate for residential or commercial construction in the Chicago area.",
  openGraph: {
    title: "Contact Homescape Construction",
    description: "Get a free consultation for your construction project",
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function ContactPage() {
  const [locations, siteSettings] = await Promise.all([
    sanityFetch<Location[]>(queries.locations),
    sanityFetch<SiteSettings>(queries.siteSettings),
  ]);

  return (
    <div className="page">
      <div className="container section">
        <div className="section-label animate-fade-up">Contact</div>
        <h1 className="section-title animate-fade-up animate-delay-1">
          Let&apos;s build something great
        </h1>
        <p
          className="section-subtitle animate-fade-up animate-delay-2 hide-mobile"
          style={{ marginBottom: "3rem" }}
        >
          Ready to start your project? Reach out and we&apos;ll get back to you!
        </p>
        <div className="contact-grid">
          <div className="animate-fade-up animate-delay-3">
            <ContactForm />
          </div>
          <div className="animate-fade-up animate-delay-4">
            {locations.map((loc) => (
              <div key={loc._id} className="location-card">
                {loc.address && (
                  <div className="location-detail">
                    {Icons.mapPin} {loc.address}
                  </div>
                )}
                {siteSettings.phone && (
                  <>
                    <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                      Call Us
                    </div>
                    <div className="location-detail hide-mobile">
                      {Icons.phone} {siteSettings.phone}
                    </div>
                    <a
                      className="location-detail show-mobile-only"
                      href={`tel:${siteSettings.phone.replace(/\D/g, "")}`}
                    >
                      {Icons.phone} {siteSettings.phone}
                    </a>
                  </>
                )}
                {siteSettings.email && (
                  <div style={{ marginTop: "2rem" }}>
                    <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                      Email Us
                    </div>
                    <a
                      className="location-detail"
                      href={`mailto:${siteSettings.email}`}
                      style={{ fontSize: "0.95rem" }}
                    >
                      {Icons.mail} {siteSettings.email}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
