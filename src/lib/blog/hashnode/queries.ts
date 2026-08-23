/**
 * Hashnode GraphQL documents.
 *
 * Verified against the schema shipped in .agents/skills/gql-api. Two things
 * that are easy to get wrong:
 *
 *   - There is no top-level post-by-slug query. Posts are reached through
 *     `publication(host:).post(slug:)`.
 *   - `publication` itself is Pro-gated. Without an active plan it returns
 *     FORBIDDEN, which is why every call site has a snapshot fallback.
 */

const POST_FIELDS = /* GraphQL */ `
  fragment PostFields on Post {
    id
    title
    subtitle
    slug
    brief
    readTimeInMinutes
    publishedAt
    updatedAt
    canonicalUrl
    coverImage {
      url
    }
    author {
      name
      username
      profilePicture
    }
    tags {
      name
      slug
    }
    series {
      name
      slug
    }
    seo {
      title
      description
    }
    ogMetaData {
      image
    }
  }
`;

/** One page of posts. Hashnode paginates by cursor, not offset. */
export const POSTS_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query Posts($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      id
      title
      posts(first: $first, after: $after) {
        edges {
          node {
            ...PostFields
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

/** A single post including its body. */
export const POST_QUERY = /* GraphQL */ `
  ${POST_FIELDS}
  query Post($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        ...PostFields
        content {
          markdown
        }
      }
    }
  }
`;
