import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import type { BlogPost } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<BlogPost | null>(queries.blogPostBySlug, { slug });

  if (!post) {
    return { title: "Post Not Found | Homescape Construction" };
  }

  return {
    title: `${post.title} | Homescape Construction`,
    description: post.excerpt || `Read about ${post.title} on the Homescape Construction blog.`,
  };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(queries.allBlogSlugs);
  return slugs.map((slug) => ({ slug }));
}

// Render Portable Text blocks
function renderPortableText(blocks: BlogPost["body"]) {
  if (!blocks) return null;

  return blocks.map((block) => {
    if (block._type !== "block") return null;

    const text = block.children?.map((child) => child.text).join("") || "";

    const headingStyle = {
      fontWeight: 700,
      color: "var(--text-primary, #1a1a1a)",
    };

    switch (block.style) {
      case "h1":
        return <h1 key={block._key} style={{ fontSize: "2rem", margin: "2rem 0 1rem", ...headingStyle }}>{text}</h1>;
      case "h2":
        return <h2 key={block._key} style={{ fontSize: "1.5rem", margin: "2rem 0 1rem", ...headingStyle }}>{text}</h2>;
      case "h3":
        return <h3 key={block._key} style={{ fontSize: "1.25rem", margin: "1.5rem 0 0.75rem", fontWeight: 600 }}>{text}</h3>;
      case "h4":
        return <h4 key={block._key} style={{ fontSize: "1.1rem", margin: "1.25rem 0 0.5rem", fontWeight: 600 }}>{text}</h4>;
      case "blockquote":
        return (
          <blockquote key={block._key} style={{
            margin: "1.5rem 0",
            padding: "1rem 1.5rem",
            borderLeft: "4px solid #6b9b1c",
            background: "rgba(107, 155, 28, 0.05)",
            fontStyle: "italic",
          }}>
            {text}
          </blockquote>
        );
      default:
        return <p key={block._key} style={{ margin: "0 0 1.25rem 0" }}>{text}</p>;
    }
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await sanityFetch<BlogPost | null>(queries.blogPostBySlug, { slug });

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
    <main style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem 1rem 4rem",
    }}>
      <article>
        <header style={{
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid var(--border, #eee)",
        }}>
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

          {post.category && (
            <span style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b9b1c",
              background: "rgba(107, 155, 28, 0.1)",
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              width: "fit-content",
            }}>
              {post.category}
            </span>
          )}

          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            lineHeight: 1.2,
            margin: "0 0 1rem 0",
            color: "var(--text-primary, #1a1a1a)",
          }}>
            {post.title}
          </h1>

          {formattedDate && (
            <time
              dateTime={post.publishedAt}
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "var(--text-muted, #999)",
                marginBottom: "1rem",
              }}
            >
              {formattedDate}
            </time>
          )}

          {post.excerpt && (
            <p style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary, #555)",
              lineHeight: 1.6,
              margin: 0,
            }}>
              {post.excerpt}
            </p>
          )}
        </header>

        <div style={{
          fontSize: "1.05rem",
          lineHeight: 1.8,
          color: "var(--text-primary, #333)",
        }}>
          {renderPortableText(post.body)}
        </div>

        {post.dataSources && post.dataSources.length > 0 && (
          <footer style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border, #eee)",
          }}>
            <p style={{
              fontSize: "0.85rem",
              color: "var(--text-muted, #999)",
            }}>
              <strong>Data sources:</strong> {post.dataSources.join(", ")}
            </p>
          </footer>
        )}
      </article>

      {/* JSON-LD for Article schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            author: {
              "@type": "Organization",
              name: "Homescape Construction",
            },
            publisher: {
              "@type": "Organization",
              name: "Homescape Construction",
              url: "https://homescapeconstruction.com",
            },
          }),
        }}
      />
    </main>
  );
}
