import { defineType, defineField } from "sanity";

export const aboutContent = defineType({
  name: "aboutContent",
  title: "About Page",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "story",
      title: "Story",
      type: "text",
      rows: 5,
      validation: (R) => R.required(),
    }),
    defineField({
      name: "image",
      title: "About Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption displayed below the image.",
        }),
        defineField({
          name: "photoCredit",
          title: "Photo Credit",
          type: "string",
          description: "Photographer or source credit (e.g., 'Courtesy of Sam Jenkins').",
        }),
      ],
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL (fallback)",
      type: "url",
      description: "Used if no image is uploaded above.",
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "headline" },
  },
});
