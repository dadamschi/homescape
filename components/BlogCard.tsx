"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

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

interface BlogCardProps {
  post: Pick<
    BlogPost,
    "_id" | "title" | "slug" | "publishedAt" | "excerpt" | "categories" | "mainImage" | "author"
  >;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article
      style={{
        background: "var(--card-bg, #fff)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
      }}
    >
      <Link href={`/blog/${post.slug.current}`} style={{ textDecoration: "none" }}>
        {post.mainImage?.asset && (
          <div style={{ position: "relative", width: "100%", height: "200px" }}>
            <Image
              src={urlFor(post.mainImage).width(600).height(400).url()}
              alt={post.mainImage.alt || post.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div style={{ padding: "1.5rem" }}>
          {post.categories && post.categories.length > 0 && (
            <div
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}
            >
              {post.categories.map((cat) => {
                const colors = categoryColors[cat] || defaultColor;
                return (
                  <span
                    key={cat}
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: colors.text,
                      background: colors.bg,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {cat}
                  </span>
                );
              })}
            </div>
          )}
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              lineHeight: 1.3,
              margin: "0 0 0.75rem 0",
              color: "var(--text-primary, #1a1a1a)",
            }}
          >
            {post.title}
          </h2>
          {post.excerpt && (
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--text-secondary, #666)",
                margin: "0 0 1rem 0",
              }}
            >
              {post.excerpt}
            </p>
          )}
          {formattedDate && (
            <time
              dateTime={post.publishedAt}
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted, #999)",
              }}
            >
              {formattedDate}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}
