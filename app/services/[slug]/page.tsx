import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { sanityFetch, sanityFetchPreview, urlFor } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { ServicePage, PortableTextBlock } from "@/lib/types";
import ContactForm from "@/components/ContactForm";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Cached fetch to deduplicate between generateMetadata and page
const getServicePage = cache(async (slug: string, preview = false): Promise<ServicePage | null> => {
  // For preview, use a query that doesn't filter by isPublished
  const query = preview
    ? `*[_type == "servicePage" && slug.current == $slug][0] {
          _id, title, slug, heroHeadline, heroSubheadline, heroImage, overview,
          process, costRange, timeline, chicagoConsiderations, faq,
          relatedProjects[]-> { _id, title, category, image, year },
          seo, isPublished
        }`
    : queries.servicePageBySlug;

  return sanityFetchPreview<ServicePage | null>(query, { slug }, preview);
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const service = await getServicePage(slug, isPreview);

  if (!service) {
    return { title: "Service Not Found" };
  }

  const title = service.seo?.metaTitle || `${service.title} Chicago | Homescape Construction`;
  const description =
    service.seo?.metaDescription ||
    `Professional ${service.title.toLowerCase()} services in Chicago. ${service.heroSubheadline || "Contact Homescape Construction for a free consultation."}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(service.heroImage?.asset && {
        images: [{ url: urlFor(service.heroImage).width(1200).height(630).url() }],
      }),
    },
    alternates: {
      canonical: `https://homescapeconstruction.com/services/${slug}`,
    },
    // Prevent indexing of preview pages
    ...(isPreview && { robots: { index: false, follow: false } }),
  };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(queries.allServiceSlugs);
  return slugs.map((slug) => ({ slug }));
}

// Render Portable Text children with link support
function renderChildren(
  children: Array<{ _key: string; _type: string; text: string; marks?: string[] }> | undefined,
  markDefs: Array<{ _key: string; _type: string; href?: string }> | undefined
) {
  if (!children) return null;

  return children.map((child) => {
    if (!child.marks || child.marks.length === 0) {
      return <span key={child._key}>{child.text}</span>;
    }

    const linkMark = child.marks.find((mark) => {
      const def = markDefs?.find((d) => d._key === mark);
      return def?._type === "link";
    });

    if (linkMark) {
      const linkDef = markDefs?.find((d) => d._key === linkMark);
      const href = linkDef?.href || "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          key={child._key}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          style={{ color: "#6b9b1c", textDecoration: "underline" }}
        >
          {child.text}
        </a>
      );
    }

    return <span key={child._key}>{child.text}</span>;
  });
}

// Render Portable Text blocks for overview
function renderPortableText(blocks: PortableTextBlock[] | undefined) {
  if (!blocks) return null;

  return blocks.map((block) => {
    if (block._type !== "block") return null;

    const children = renderChildren(block.children, block.markDefs);

    switch (block.style) {
      case "h2":
        return (
          <h3 key={block._key} className="service-overview-heading">
            {children}
          </h3>
        );
      case "h3":
        return (
          <h4 key={block._key} className="service-overview-subheading">
            {children}
          </h4>
        );
      default:
        return (
          <p key={block._key} className="service-overview-paragraph">
            {children}
          </p>
        );
    }
  });
}

// Service schema for structured data
function ServiceSchema({ service, slug }: { service: ServicePage; slug: string }) {
  const description =
    service.seo?.metaDescription ||
    `Professional ${service.title.toLowerCase()} services in Chicago by Homescape Construction.`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} in Chicago`,
    description,
    provider: {
      "@id": "https://www.homescapeconstruction.com/#organization",
    },
    areaServed: {
      "@type": "City",
      name: "Chicago",
      sameAs: "https://en.wikipedia.org/wiki/Chicago",
    },
    url: `https://www.homescapeconstruction.com/services/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb schema
function BreadcrumbSchema({ service, slug }: { service: ServicePage; slug: string }) {
  const schema = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `https://homescapeconstruction.com/services/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function ServicePageRoute({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const service = await getServicePage(slug, isPreview);

  if (!service) {
    notFound();
  }

  return (
    <>
      <ServiceSchema service={service} slug={slug} />
      <BreadcrumbSchema service={service} slug={slug} />

      {isPreview && (
        <div className="preview-banner">
          <span>Preview Mode — This is a draft</span>
        </div>
      )}

      <main className="service-page">
        {/* Hero Section */}
        <section className="service-hero">
          <div className="container">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{service.title}</span>

            <h1 className="service-hero-title">{service.heroHeadline}</h1>
            {service.heroSubheadline && (
              <p className="service-hero-subtitle">{service.heroSubheadline}</p>
            )}

            <div className="service-hero-stats">
              <div className="service-stat">
                <span className="service-stat-value">200+</span>
                <span className="service-stat-label">Projects</span>
              </div>
              <div className="service-stat">
                <span className="service-stat-value">13+</span>
                <span className="service-stat-label">Years</span>
              </div>
              <div className="service-stat">
                <span className="service-stat-value">98%</span>
                <span className="service-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Image */}
        {service.heroImage?.asset && (
          <section className="service-hero-image">
            <div className="container">
              <Image
                src={urlFor(service.heroImage).width(1200).height(600).url()}
                alt={service.heroImage.alt || service.title}
                width={1200}
                height={600}
                className="service-hero-img"
                priority
              />
            </div>
          </section>
        )}

        {/* Overview Section */}
        {service.overview && service.overview.length > 0 && (
          <section className="service-section">
            <div className="container">
              <h2 className="service-section-title">Overview</h2>
              <div className="service-overview">{renderPortableText(service.overview)}</div>
            </div>
          </section>
        )}

        {/* Process Section */}
        {service.process && service.process.length > 0 && (
          <section className="service-section service-section-alt">
            <div className="container">
              <h2 className="service-section-title">Our Process</h2>
              <div className="service-process">
                {service.process.map((step, index) => (
                  <div key={index} className="process-step">
                    <div className="process-step-number">{index + 1}</div>
                    <div className="process-step-content">
                      <h3 className="process-step-title">{step.title}</h3>
                      <p className="process-step-desc">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cost & Timeline Section */}
        {(service.costRange || service.timeline) && (
          <section className="service-section">
            <div className="container">
              <div className="service-cost-timeline">
                {service.costRange && (
                  <div className="service-cost">
                    <h2 className="service-section-title">Investment</h2>
                    <div className="cost-range">
                      <span className="cost-low">{service.costRange.low}</span>
                      <span className="cost-separator">–</span>
                      <span className="cost-high">{service.costRange.high}</span>
                    </div>
                    {service.costRange.note && (
                      <p className="cost-note">{service.costRange.note}</p>
                    )}
                  </div>
                )}
                {service.timeline && (
                  <div className="service-timeline">
                    <h2 className="service-section-title">Timeline</h2>
                    <p className="timeline-value">{service.timeline}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Chicago Considerations */}
        {service.chicagoConsiderations && service.chicagoConsiderations.length > 0 && (
          <section className="service-section service-section-alt">
            <div className="container">
              <h2 className="service-section-title">Chicago-Specific Considerations</h2>
              <ul className="chicago-list">
                {service.chicagoConsiderations.map((item, index) => (
                  <li key={index} className="chicago-list-item">
                    <span className="chicago-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {service.faq && service.faq.length > 0 && (
          <section className="service-section">
            <div className="container">
              <h2 className="service-section-title">Frequently Asked Questions</h2>
              <div className="service-faq">
                {service.faq.map((faq, index) => (
                  <details key={index} className="faq-item">
                    <summary className="faq-question">{faq.question}</summary>
                    <p className="faq-answer">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {service.relatedProjects && service.relatedProjects.length > 0 && (
          <section className="service-section service-section-alt">
            <div className="container">
              <h2 className="service-section-title">Related Projects</h2>
              <div className="related-projects-grid">
                {service.relatedProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects?filter=${encodeURIComponent(project.category)}`}
                    className="related-project-card"
                  >
                    {project.image?.asset && (
                      <Image
                        src={urlFor(project.image).width(400).height(300).url()}
                        alt={project.title}
                        width={400}
                        height={300}
                        className="related-project-img"
                      />
                    )}
                    <div className="related-project-info">
                      <h3 className="related-project-title">{project.title}</h3>
                      <p className="related-project-meta">
                        {project.category} • {project.year}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="service-section service-cta-section">
          <div className="container">
            <div className="service-cta">
              <div className="service-cta-text">
                <h2>Ready to Start Your {service.title} Project?</h2>
                <p>
                  Get a free consultation and estimate. We&apos;ll discuss your vision, timeline,
                  and budget.
                </p>
              </div>
              <div className="service-cta-form">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
