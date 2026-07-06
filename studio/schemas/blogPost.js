import { defineType, defineField } from "sanity";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Author name for E-E-A-T (e.g., 'Dave / Homescape Construction')",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Brief summary for listings and meta description (max 160 chars)",
      validation: (R) => R.max(160),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for accessibility and SEO",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Remodeling", value: "Remodeling" },
          { title: "Permits", value: "Permits" },
          { title: "Seasonal", value: "Seasonal" },
          { title: "Projects", value: "Projects" },
          { title: "Guides", value: "Guides" },
          { title: "Chicago Trends", value: "Chicago Trends" },
          { title: "Home Improvement", value: "Home Improvement" },
        ],
      },
    }),
    defineField({
      name: "serviceType",
      title: "Service Type",
      type: "string",
      description: "For Service schema markup when post is about a specific service",
      options: {
        list: [
          "Custom Home Building",
          "Kitchen Remodeling",
          "Bathroom Remodeling",
          "Home Additions",
          "Basement Finishing",
          "ADU & Garage Conversions",
          "General Contracting",
        ],
      },
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description:
            "Override title for search results (include one ' | Homescape Construction' suffix, aim for 50-70 chars total)",
          validation: (R) => R.min(40).max(70),
        }),
        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 2,
          description: "Description for search results (max 160 chars)",
          validation: (R) => R.max(160),
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      description: "FAQ items for FAQPage schema markup (3-5 recommended)",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
              description: "40-60 words recommended",
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),
    defineField({
      name: "dataSources",
      title: "Data Sources",
      type: "array",
      of: [{ type: "string" }],
      description: "Sources used to generate this post (for transparency)",
    }),
    defineField({
      name: "generatedAt",
      title: "Generated At",
      type: "datetime",
      description: "When AI generated this draft",
    }),
    defineField({
      name: "qualityScore",
      title: "Quality Score",
      type: "number",
      description: "AI quality score (0-100) from multi-pass generation",
      validation: (R) => R.min(0).max(100),
      readOnly: true,
    }),
    defineField({
      name: "wordCount",
      title: "Word Count",
      type: "number",
      description: "Estimated word count of the post body",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "author",
      media: "mainImage",
    },
  },
});
