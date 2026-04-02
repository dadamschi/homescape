import { defineType, defineField } from "sanity";

export const location = defineType({
  name: "location",
  title: "Location",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Office Name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "string",
    }),
    defineField({
      name: "hours",
      title: "Hours",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "address" },
  },
});
