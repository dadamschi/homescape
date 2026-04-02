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
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Brief summary for listings and SEO",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Chicago Trends",
          "Seasonal Tips",
          "Industry News",
          "Home Improvement",
          "Service",
        ],
      },
    }),
    defineField({
      name: "serviceType",
      title: "Service Type",
      type: "string",
      description: "Required when category is 'Service' - used for Service schema markup",
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
      hidden: ({ parent }) => parent?.category !== "Service",
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
  ],
  preview: {
    select: { title: "title", subtitle: "category" },
  },
});
