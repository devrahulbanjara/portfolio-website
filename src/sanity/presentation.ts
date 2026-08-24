import { defineDocuments, defineLocations } from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";

/**
 * Wires the Presentation tool both ways:
 * - mainDocuments: given a URL open in the preview iframe, which document is it
 * - locations: given a document open in the editor, where does it appear
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {
      route: "/blogs/:slug",
      filter: `_type == "post" && slug.current == $slug`,
    },
  ]),
  locations: {
    post: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled post",
            href: `/blogs/${doc?.slug}`,
          },
          { title: "Blogs", href: "/blogs" },
        ],
      }),
    }),
    tag: defineLocations({
      select: { name: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.name || "Untitled tag",
            href: `/blogs/tag/${doc?.slug}`,
          },
        ],
      }),
    }),
  },
};
