import {defineType, defineField, defineArrayMember} from "sanity";

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
    defineField({
      name: "heroImages",
      title: "Hero Background Images",
      description: "Images used for hero section backgrounds. Upload multiple to rotate through them.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt Text",
              description: "Describe the image for accessibility",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "headline" },
  },
});
