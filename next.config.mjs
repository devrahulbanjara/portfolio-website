/**
 * PostHog ingestion is proxied through this domain so ad blockers, which drop
 * requests to posthog.com outright, cannot silently erase a large slice of a
 * developer audience from the analytics.
 *
 * Assets and events live on different hosts: the assets host serves the
 * lazy-loaded replay and survey bundles with long cache headers, and routing
 * those through the events host would throw that caching away.
 */
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_INGEST_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  /^https:\/\/(us|eu)\.i\./,
  "https://$1-assets.i.",
);

/**
 * Fail the build rather than publish a secret.
 *
 * PostHog has two key types that are easy to mix up: phc_ is the project key,
 * public by design, and phx_ is a personal key carrying the same access as
 * logging into the account. Next inlines every NEXT_PUBLIC_ value into the
 * JavaScript served to visitors, so a phx_ key here would be readable by
 * anyone viewing source — and it cannot authenticate event capture anyway, so
 * the mistake otherwise surfaces only as silence in the dashboard.
 */
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (posthogKey && !posthogKey.startsWith("phc_")) {
  const message =
    `NEXT_PUBLIC_POSTHOG_KEY must be a project key starting with "phc_", but it starts with "${posthogKey.slice(0, 4)}". ` +
    `Personal keys (phx_) are secrets and must never be exposed client-side. ` +
    `Copy the project key from PostHog under Project settings -> Project API key.`;

  // Only fatal for production builds. A wrong key locally is worth a loud
  // warning, but not a broken dev server on a site where analytics is
  // incidental to everything else you might be working on.
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(`\n⚠  ${message}\n`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // PostHog's API rejects the trailing-slash redirect Next would otherwise
  // apply to proxied ingestion paths.
  skipTrailingSlashRedirect: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ];
  },

  async headers() {
    /**
     * frame-ancestors 'self' rather than X-Frame-Options: DENY.
     *
     * The Sanity Presentation tool previews the site by loading it in an iframe
     * from /studio — same origin, so 'self' allows exactly that and nothing
     * else. DENY blocked it outright, and there is no per-path exception that
     * would work, because the previewed pages are the public ones.
     *
     * Deliberately frame-ancestors only. Adding default-src here would break
     * PostHog silently: connect-src falls back to default-src, so 'self' would
     * block event delivery while the SDK still looked healthy.
     */
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
    ];

    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
