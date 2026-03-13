import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Client Name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "project",
      title: "Project Name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (R) => R.required(),
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (R) => R.required().min(1).max(5),
      initialValue: 5,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "project" },
  },
});
