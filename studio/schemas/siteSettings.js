import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "companyName",
      title: "Company Name",
      type: "string",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "servingSince",
      title: "Serving Since",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "social",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({ name: "facebook", type: "url", title: "Facebook" }),
        defineField({ name: "instagram", type: "url", title: "Instagram" }),
        defineField({ name: "linkedin", type: "url", title: "LinkedIn" }),
      ],
    }),
  ],
  preview: {
    select: { title: "companyName" },
  },
});
