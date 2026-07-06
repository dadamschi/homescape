import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { sanityFetch, urlFor } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { ServicePage } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our Services | Homescape Construction Chicago",
  description:
    "Explore our full range of home construction and remodeling services in Chicago. Kitchen remodeling, bathroom renovations, home additions, custom homes, and more.",
  alternates: {
    canonical: "https://homescapeconstruction.com/services",
  },
};

export default async function ServicesPage() {
  const services = await sanityFetch<ServicePage[]>(queries.servicePages);

  return (
    <main className="services-index-page">
      <section className="services-index-hero">
        <div className="container">
          <h1 className="services-index-title">Our Services</h1>
          <p className="services-index-subtitle">
            From kitchen renovations to custom home builds, we bring Chicago homeowners&apos;
            visions to life with expert craftsmanship and local expertise.
          </p>
        </div>
      </section>

      <section className="services-index-grid-section">
        <div className="container">
          <div className="services-index-grid">
            {services.map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug.current}`}
                className="service-card"
              >
                {service.heroImage?.asset && (
                  <div className="service-card-image">
                    <Image
                      src={urlFor(service.heroImage).width(600).height(400).url()}
                      alt={service.heroImage.alt || service.title}
                      width={600}
                      height={400}
                      className="service-card-img"
                    />
                  </div>
                )}
                <div className="service-card-content">
                  <h2 className="service-card-title">{service.title}</h2>
                  <p className="service-card-headline">{service.heroHeadline}</p>
                  <span className="service-card-link">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>

          {services.length === 0 && (
            <div className="services-empty">
              <p>Service pages coming soon. Contact us to learn about our offerings.</p>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://homescapeconstruction.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Services",
                item: "https://homescapeconstruction.com/services",
              },
            ],
          }),
        }}
      />
    </main>
  );
}
