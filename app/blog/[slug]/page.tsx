import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { sanityFetch, sanityFetchPreview, urlFor } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { BlogPost } from "@/lib/types";
import BlogCTA from "@/components/BlogCTA";

// Category color mapping for consistent pill styling
const categoryColors: Record<string, { bg: string; text: string }> = {
  Remodeling: { bg: "rgba(107, 155, 28, 0.15)", text: "#5a8a15" },
  Permits: { bg: "rgba(59, 130, 246, 0.15)", text: "#2563eb" },
  Seasonal: { bg: "rgba(245, 158, 11, 0.15)", text: "#b45309" },
  Projects: { bg: "rgba(139, 92, 246, 0.15)", text: "#7c3aed" },
  Guides: { bg: "rgba(20, 184, 166, 0.15)", text: "#0d9488" },
  "Chicago Trends": { bg: "rgba(239, 68, 68, 0.15)", text: "#dc2626" },
  "Home Improvement": { bg: "rgba(236, 72, 153, 0.15)", text: "#db2777" },
};

const defaultColor = { bg: "rgba(107, 155, 28, 0.1)", text: "#6b9b1c" };

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Cached fetch to deduplicate between generateMetadata and page
const getBlogPost = cache(async (slug: string, preview = false): Promise<BlogPost | null> => {
  // For preview, fetch without the publishedAt filter
  const query = preview
    ? `*[_type == "blogPost" && slug.current == $slug][0] {
        _id, _updatedAt, title, slug, author, publishedAt, excerpt,
        mainImage, body, categories, serviceType, seo, faq, dataSources
      }`
    : queries.blogPostBySlug;

  return sanityFetchPreview<BlogPost | null>(query, { slug }, preview);
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const post = await getBlogPost(slug, isPreview);

  if (!post) {
    return { title: "Post Not Found | Homescape Construction" };
  }

  const title = post.seo?.metaTitle || `${post.title} | Homescape Construction`;
  const description =
    post.seo?.metaDescription ||
    post.excerpt ||
    `Read about ${post.title} on the Homescape Construction blog.`;

  return {
    title,
    description,
    openGraph: post.mainImage?.asset
      ? {
          images: [{ url: urlFor(post.mainImage).width(1200).height(630).url() }],
        }
      : undefined,
    alternates: {
      canonical: `https://homescapeconstruction.com/blog/${slug}`,
    },
    // Prevent indexing of preview pages
    ...(isPreview && { robots: { index: false, follow: false } }),
  };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(queries.allBlogSlugs);
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

    // Find link marks
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

// Render a table block
function renderTable(block: { _key: string; headers: string[]; rows: string[][] }) {
  return (
    <div key={block._key} style={{ overflowX: "auto", margin: "1.5rem 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.95rem",
          border: "1px solid #e5e5e5",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(107, 155, 28, 0.1)" }}>
            {block.headers.map((header, i) => (
              <th
                key={i}
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  fontWeight: 600,
                  borderBottom: "2px solid #6b9b1c",
                  whiteSpace: "nowrap",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                background: rowIdx % 2 === 0 ? "white" : "rgba(0, 0, 0, 0.02)",
              }}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Render Portable Text blocks
function renderPortableText(blocks: BlogPost["body"]) {
  if (!blocks) return null;

  return blocks.map((block) => {
    // Handle table blocks
    if (block._type === "table") {
      return renderTable(block);
    }

    if (block._type !== "block") return null;

    const children = renderChildren(block.children, block.markDefs);
    const text = block.children?.map((child) => child.text).join("") || "";

    const headingStyle = {
      fontWeight: 700,
      color: "var(--text-primary, #1a1a1a)",
    };

    switch (block.style) {
      case "h1":
        return (
          <h1 key={block._key} style={{ fontSize: "2rem", margin: "2rem 0 1rem", ...headingStyle }}>
            {children}
          </h1>
        );
      case "h2":
        return (
          <h2
            key={block._key}
            style={{ fontSize: "1.5rem", margin: "2rem 0 1rem", ...headingStyle }}
          >
            {children}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={block._key}
            style={{ fontSize: "1.25rem", margin: "1.5rem 0 0.75rem", fontWeight: 600 }}
          >
            {children}
          </h3>
        );
      case "h4":
        return (
          <h4
            key={block._key}
            style={{ fontSize: "1.1rem", margin: "1.25rem 0 0.5rem", fontWeight: 600 }}
          >
            {children}
          </h4>
        );
      case "blockquote":
        return (
          <blockquote
            key={block._key}
            style={{
              margin: "1.5rem 0",
              padding: "1rem 1.5rem",
              borderLeft: "4px solid #6b9b1c",
              background: "rgba(107, 155, 28, 0.05)",
              fontStyle: "italic",
            }}
          >
            {children}
          </blockquote>
        );
      default:
        if (text.startsWith("**") && text.endsWith("**")) {
          const noStarText = text.replaceAll("*", "");
          return (
            <p key={block._key} style={{ margin: "0 0 1.25rem 0", fontWeight: "bold" }}>
              {noStarText}
            </p>
          );
        }
        return (
          <p key={block._key} style={{ margin: "0 0 1.25rem 0" }}>
            {children}
          </p>
        );
    }
  });
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const post = await getBlogPost(slug, isPreview);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      {isPreview && (
        <div className="preview-banner">
          <span>Preview Mode — This is a draft</span>
        </div>
      )}
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: isPreview ? "4rem 1rem 4rem" : "2rem 1rem 4rem",
        }}
      >
        <article>
          <header
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid var(--border, #eee)",
            }}
          >
            <Link
              href="/blog"
              style={{
                display: "inline-block",
                fontSize: "0.9rem",
                color: "#6b9b1c",
                textDecoration: "none",
                marginBottom: "1.5rem",
              }}
            >
              &larr; Back to Blog
            </Link>

            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                lineHeight: 1.2,
                margin: "0 0 1rem 0",
                color: "var(--text-primary, #1a1a1a)",
              }}
            >
              {post.title}
            </h1>

            {post.categories && post.categories.length > 0 && (
              <div
                style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}
              >
                {post.categories.map((cat) => {
                  const colors = categoryColors[cat] || defaultColor;
                  return (
                    <span
                      key={cat}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: colors.text,
                        background: colors.bg,
                        padding: "0.3rem 0.85rem",
                        borderRadius: "9999px",
                      }}
                    >
                      {cat}
                    </span>
                  );
                })}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              {formattedDate && (
                <time
                  dateTime={post.publishedAt}
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-muted, #999)",
                  }}
                >
                  {formattedDate}
                </time>
              )}
              {post.author && (
                <>
                  <span style={{ color: "var(--text-muted, #999)" }}>·</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #999)" }}>
                    {post.author}
                  </span>
                </>
              )}
            </div>

            {post.mainImage?.asset && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "400px",
                  marginBottom: "1.5rem",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={urlFor(post.mainImage).width(800).height(400).url()}
                  alt={post.mainImage.alt || post.title}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}

            {post.excerpt && (
              <p
                style={{
                  fontSize: "1.15rem",
                  color: "var(--text-secondary, #555)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {post.excerpt}
              </p>
            )}
          </header>

          <div
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "var(--text-primary, #333)",
            }}
          >
            {renderPortableText(post.body)}
          </div>

          {/* CTA Module - rotates copy automatically */}
          <BlogCTA />

          {post.dataSources && post.dataSources.length > 0 && (
            <footer
              style={{
                marginTop: "3rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--border, #eee)",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted, #999)",
                }}
              >
                <strong>Data sources:</strong> {post.dataSources.join(", ")}
              </p>
            </footer>
          )}
        </article>

        {/* JSON-LD for BreadcrumbList schema */}
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
                  name: "Blog",
                  item: "https://homescapeconstruction.com/blog",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: `https://homescapeconstruction.com/blog/${post.slug.current}`,
                },
              ],
            }),
          }}
        />

        {/* JSON-LD for Article schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://homescapeconstruction.com/blog/${post.slug.current}`,
              },
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
              dateModified: post._updatedAt || post.publishedAt,
              ...(post.mainImage?.asset && {
                image: urlFor(post.mainImage).width(1200).height(630).url(),
              }),
              author: post.author
                ? {
                    "@type": "Person",
                    name: post.author.split("/")[0].trim(),
                    worksFor: {
                      "@type": "Organization",
                      name: "Homescape Construction",
                    },
                  }
                : {
                    "@type": "Organization",
                    name: "Homescape Construction",
                  },
              publisher: {
                "@type": "Organization",
                name: "Homescape Construction",
                url: "https://homescapeconstruction.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://homescapeconstruction.com/logo.png",
                },
              },
              isPartOf: {
                "@id": "https://www.homescapeconstruction.com/#website",
              },
            }),
          }}
        />

        {/* JSON-LD for FAQPage schema (if FAQ content exists) */}
        {post.faq && post.faq.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: post.faq.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer,
                  },
                })),
              }),
            }}
          />
        )}

        {/* JSON-LD for Service schema (only for service-type posts) */}
        {post.serviceType && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                name: `${post.serviceType} in Chicago`,
                description: post.excerpt,
                provider: {
                  "@id": "https://www.homescapeconstruction.com/#organization",
                },
                areaServed: {
                  "@type": "State",
                  name: "Illinois",
                },
                url: `https://www.homescapeconstruction.com/blog/${post.slug.current}`,
              }),
            }}
          />
        )}
      </main>
    </>
  );
}
