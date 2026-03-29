"use client";

import Link from "next/link";
import type { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: Pick<BlogPost, "_id" | "title" | "slug" | "publishedAt" | "excerpt" | "category">;
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
        <div style={{ padding: "1.5rem" }}>
          {post.category && (
            <span
              style={{
                display: "inline-block",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b9b1c",
                background: "rgba(107, 155, 28, 0.1)",
                padding: "0.25rem 0.75rem",
                borderRadius: "4px",
                marginBottom: "0.75rem",
              }}
            >
              {post.category}
            </span>
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
