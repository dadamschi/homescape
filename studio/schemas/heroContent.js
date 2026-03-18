import { defineType, defineField } from "sanity";

export const heroContent = defineType({
  name: "heroContent",
  title: "Hero on Home Page",
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
  ],
  preview: {
    select: { title: "headline" },
  },
});
