import { defineQuery } from "next-sanity";

/**
 * Only published, already-dated posts are ever visible.
 *
 * The dateTime(now()) guard is what makes scheduling work: setting publishedAt
 * in the future keeps a post off the site until then. Without it, publishing
 * and scheduling would be the same action.
 */
const VISIBLE = `_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()`;

/** Fields every list view needs. Deliberately excludes body. */
const SUMMARY_FIELDS = `
  "id": _id,
  "slug": slug.current,
  title,
  subtitle,
  brief,
  publishedAt,
  "updatedAt": _updatedAt,
  "coverImage": coverImage{
    "url": asset->url,
    "alt": coalesce(alt, ""),
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "lqip": asset->metadata.lqip
  },
  "tags": tags[]->{ name, "slug": slug.current },
  "seo": {
    "title": seo.title,
    "description": seo.description,
    "ogImage": seo.ogImage.asset->url
  }
`;

/**
 * Word count for reading time, computed by Sanity rather than shipped as body
 * text. /blogs needs a reading time per card but must not download every post
 * body to get one.
 */
const WORD_COUNT = `"wordCount": length(string::split(pt::text(body), " "))`;

export const postsQuery = defineQuery(`
  *[${VISIBLE}] | order(publishedAt desc) {
    ${SUMMARY_FIELDS},
    ${WORD_COUNT}
  }
`);

export const postBySlugQuery = defineQuery(`
  *[${VISIBLE} && slug.current == $slug][0] {
    ${SUMMARY_FIELDS},
    body,
    ${WORD_COUNT}
  }
`);

export const postSlugsQuery = defineQuery(`
  *[${VISIBLE}].slug.current
`);

/**
 * Tags that actually have at least one visible post.
 *
 * Filtering on the tag side rather than deriving from the post list keeps
 * /blogs/tag/<slug> from generating pages for tags that were created and then
 * never used.
 */
export const tagsWithCountsQuery = defineQuery(`
  *[_type == "tag" && defined(slug.current) && count(*[${VISIBLE} && references(^._id)]) > 0] {
    name,
    "slug": slug.current,
    "count": count(*[${VISIBLE} && references(^._id)])
  } | order(count desc, name asc)
`);
