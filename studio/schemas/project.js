import { defineType, defineField } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Residential", "Commercial", "Renovation"],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Main Image",
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
      name: "images",
      title: "Project Images",
      type: "array",
      description: "Upload up to 20 images for this project.",
      of: [
        {
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
        },
      ],
      validation: (R) => R.max(20),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "virtualTour",
      title: "Virtual Tour URL",
      type: "url",
      description: "Link to a 360° virtual tour (e.g., Matterport, Zillow 3D Home).",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "location" },
  },
});
