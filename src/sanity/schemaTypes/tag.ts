import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Shown on post pages and tag pages, e.g. \"Machine Learning\".",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL segment for /blogs/tag/<slug>. Changing it breaks any link already pointing at the old one.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
});
