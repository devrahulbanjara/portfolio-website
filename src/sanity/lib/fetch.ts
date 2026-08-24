import "server-only";

import { draftMode } from "next/headers";

import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

/**
 * How long a cached query may serve stale content.
 *
 * Ten minutes rather than an hour because this timer IS the freshness
 * mechanism — there is no publish webhook. Ten minutes between hitting Publish
 * and seeing it live is tolerable; an hour is not.
 */
export const REVALIDATE_SECONDS = 600;

/**
 * draftMode() throws outside a request scope, which is exactly where
 * generateStaticParams runs. Static generation never previews drafts, so
 * treating that throw as "off" is the correct answer rather than a workaround.
 */
async function isDraftModeEnabled(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/**
 * Runs a GROQ query, transparently switching to drafts inside Draft Mode.
 *
 * Draft reads are uncached and untagged on purpose: an editor previewing needs
 * to see the keystroke they just saved, not a ten-minute-old copy.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  fallback,
}: {
  query: string;
  params?: Record<string, unknown>;
  fallback: T;
}): Promise<T> {
  if (!client) return fallback;

  if (await isDraftModeEnabled()) {
    if (!readToken) {
      throw new Error(
        "Draft mode is on but SANITY_API_READ_TOKEN is unset, so drafts cannot be read.",
      );
    }

    return client
      .withConfig({ token: readToken, useCdn: false, perspective: "drafts" })
      .fetch<T>(query, params, { cache: "no-store" });
  }

  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["blog"] },
  });
}
