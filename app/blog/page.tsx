import { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { queries } from "@/lib/queries";
import { BlogCard } from "@/components/BlogCard";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Chicago construction insights, seasonal tips, and home improvement advice from Homescape Construction.",
  alternates: {
    canonical: "https://homescapeconstruction.com/blog",
  },
};

type BlogListItem = Pick<
  BlogPost,
  "_id" | "title" | "slug" | "publishedAt" | "excerpt" | "categories" | "mainImage" | "author"
>;

export default async function BlogPage() {
  const posts = await sanityFetch<BlogListItem[]>(queries.blogPosts);

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1rem 4rem",
      }}
    >
      <section
        style={{
          textAlign: "center",
          padding: "2rem 0",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: "20px 0 1rem 0",
            color: "var(--text-primary, #1a1a1a)",
          }}
        >
          Construction Insights
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary, #666)",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Expert advice on Chicago construction trends, seasonal tips, and home improvement ideas
          from the Homescape team.
        </p>
      </section>

      {posts.length === 0 ? (
        <section
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--card-bg, #f9f9f9)",
            borderRadius: "12px",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary, #666)",
            }}
          >
            No blog posts yet. Check back soon for construction insights!
          </p>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </section>
      )}
    </main>
  );
}
