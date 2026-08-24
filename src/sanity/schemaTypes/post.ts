import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Meta" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "URL segment for /blogs/<slug>. Generated from the title, but safe to edit before publishing. After publishing, changing it orphans the old URL.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      group: "content",
      description: "Optional. Shown under the title on the post page only.",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "brief",
      title: "Brief",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "One or two sentences. Used on the /blogs cards, as the meta description, in the RSS feed, and on OG cards — so write it for someone who has not opened the post.",
      validation: (rule) => rule.required().min(40).max(220),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "meta",
      description:
        "Drives ordering, the displayed date, and the sitemap. Posts dated in the future are hidden from the site until that time passes.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "meta",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      description:
        "Each tag gets its own /blogs/tag/<slug> page, and shared tags are what drive the Related list.",
      validation: (rule) => rule.unique().max(6),
    }),
    defineField({
      name: "seo",
      title: "SEO overrides",
      type: "object",
      group: "seo",
      description:
        "All optional. Left blank, the post title and brief are used, and the OG card is generated from them.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "title",
          title: "Meta title",
          type: "string",
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: "description",
          title: "Meta description",
          type: "text",
          rows: 2,
          validation: (rule) => rule.max(180),
        }),
        defineField({
          name: "ogImage",
          title: "Social share image",
          type: "image",
          description:
            "Overrides both the cover image and the generated OG card. 1200x630 works best.",
        }),
      ],
    }),
  ],
  orderings: [
    {
      name: "publishedAtDesc",
      title: "Newest first",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
      media: "coverImage",
    },
    prepare({ title, publishedAt, media }) {
      return {
        title,
        subtitle: publishedAt
          ? new Date(publishedAt).toISOString().slice(0, 10)
          : "No publish date",
        media,
      };
    },
  },
});
