import "server-only";

/**
 * Viewer token used only to read drafts for Presentation / Draft Mode.
 *
 * Never NEXT_PUBLIC_. It must stay server-side: it can read unpublished
 * content. The published site never uses it — see src/sanity/lib/client.ts.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || "";
