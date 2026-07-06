import { defineType, defineField } from "sanity";

export const servicePage = defineType({
  name: "servicePage",
  title: "Service Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "details", title: "Details" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Basic info
    defineField({
      name: "title",
      title: "Service Title",
      type: "string",
      description: "e.g., 'Kitchen Remodeling'",
      validation: (R) => R.required(),
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
      group: "content",
    }),

    // Hero section
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "Main H1 headline, e.g., 'Kitchen Remodeling in Chicago'",
      validation: (R) => R.required(),
      group: "content",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero Subheadline",
      type: "text",
      rows: 2,
      description: "Supporting text below headline",
      group: "content",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
      group: "content",
    }),

    // Overview section (Portable Text for rich content)
    defineField({
      name: "overview",
      title: "Overview",
      type: "array",
      description: "Main overview section (target 200+ words)",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
      group: "content",
    }),

    // Process steps
    defineField({
      name: "process",
      title: "Our Process",
      type: "array",
      description: "Step-by-step process (typically 5 steps)",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Step Title",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
      group: "content",
    }),

    // Cost & Timeline
    defineField({
      name: "costRange",
      title: "Cost Range",
      type: "object",
      fields: [
        defineField({
          name: "low",
          title: "Low End",
          type: "string",
          description: "e.g., '$35,000'",
        }),
        defineField({
          name: "high",
          title: "High End",
          type: "string",
          description: "e.g., '$150,000+'",
        }),
        defineField({
          name: "note",
          title: "Cost Note",
          type: "text",
          rows: 2,
          description: "Additional context about pricing",
        }),
      ],
      group: "details",
    }),
    defineField({
      name: "timeline",
      title: "Typical Timeline",
      type: "string",
      description: "e.g., '8-12 weeks from permit approval to completion'",
      group: "details",
    }),

    // Chicago-specific considerations
    defineField({
      name: "chicagoConsiderations",
      title: "Chicago-Specific Considerations",
      type: "array",
      of: [{ type: "string" }],
      description: "Local factors homeowners should know about",
      group: "details",
    }),

    // FAQ section
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      description: "Frequently asked questions (3-5 recommended)",
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
              description: "40-80 words recommended",
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
      group: "content",
    }),

    // Related projects (reference to project documents)
    defineField({
      name: "relatedProjects",
      title: "Related Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Projects to showcase on this service page",
      group: "content",
    }),

    // SEO fields
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Override title for search results (50-70 chars with brand suffix)",
          validation: (R) => R.max(70),
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
      group: "seo",
    }),

    // Publishing
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      description: "Unpublished pages won't appear on the site",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in navigation/listings (lower = first)",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "heroHeadline",
      media: "heroImage",
      published: "isPublished",
    },
    prepare({ title, subtitle, media, published }) {
      return {
        title: `${published ? "" : "🚫 "}${title}`,
        subtitle,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
