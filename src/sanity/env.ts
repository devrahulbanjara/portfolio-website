/**
 * Sanity connection settings.
 *
 * All three values are NEXT_PUBLIC_ on purpose: the embedded Studio runs in the
 * browser and needs them at bundle time. None of them are secrets — a project
 * ID identifies a dataset, it does not grant write access. The only real secret
 * is SANITY_API_READ_TOKEN, which lives in src/sanity/lib/token.ts.
 */

/**
 * Sanity pins API behaviour to a date. Bumping this opts into newer GROQ and
 * query-engine semantics, so change it deliberately and re-test, never as
 * routine maintenance.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "").trim();

/**
 * Whether Sanity is wired up yet.
 *
 * Kept as a first-class state so the site builds and deploys before the Sanity
 * project exists: /blogs renders "No posts yet" and /studio renders setup
 * instructions, instead of the whole build failing on a missing env var.
 */
export const isSanityConfigured = projectId.length > 0;

/** Must match the route the Studio is mounted at, and basePath in sanity.config.ts. */
export const studioBasePath = "/studio";
