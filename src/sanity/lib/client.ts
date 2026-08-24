import { createClient, type SanityClient } from "next-sanity";

import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
  studioBasePath,
} from "@/sanity/env";

/**
 * Read client for the published dataset.
 *
 * Null until NEXT_PUBLIC_SANITY_PROJECT_ID is set — createClient throws on an
 * empty projectId, and a missing CMS should degrade to an empty blog rather
 * than a failed build. Every caller in src/lib/blog handles the null.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Served from Sanity's CDN. Stale by at most a few seconds, and the
      // route-level revalidate window is far longer than that anyway.
      useCdn: true,
      perspective: "published",
      stega: {
        // Powers click-to-edit: encoded source paths in the returned strings
        // let the Presentation tool map rendered text back to its field.
        studioUrl: studioBasePath,
      },
    })
  : null;
