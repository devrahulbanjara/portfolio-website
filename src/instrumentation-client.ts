/**
 * PostHog: product analytics, session replay, and error tracking.
 *
 * Next.js runs this module on the client before the app hydrates, which is
 * earlier than a provider component in the tree could manage — so the first
 * pageview and any boot-time exception are actually captured.
 *
 * Nothing is sent unless NEXT_PUBLIC_POSTHOG_KEY is set, matching how the rest
 * of this codebase treats optional services: Giscus renders nothing without its
 * env vars, /blogs renders an empty state without Sanity.
 */

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * Where the PostHog UI lives (app.posthog.com / eu.posthog.com). Only used to
 * build correct links back to the dashboard from the toolbar — events do not
 * go here, they go through the /ingest proxy below.
 */
const uiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com";

/**
 * Local events would pollute the same funnels and session recordings as real
 * traffic, and "top pages" full of localhost is worse than no data. Set
 * NEXT_PUBLIC_POSTHOG_DEBUG=1 to opt a dev session back in when verifying that
 * the wiring itself works.
 */
const enabledInThisEnvironment =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "1";

/**
 * Imported dynamically rather than at the top of the file so that the ~270kB
 * SDK is only fetched when it will actually be used. A static import ships it
 * to every visitor even when the key is unset, which is the exact situation
 * this file is written to tolerate.
 *
 * The cost is that errors thrown in the first moments of page load can land
 * before the handlers attach. Server-rendered HTML is already on screen by
 * then, so what is missed is a narrow window of hydration-time failures.
 */
if (key && enabledInThisEnvironment) {
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      /**
       * Relative, so requests go to this domain and are rewritten server-side
       * to PostHog (see the /ingest rewrites in next.config.mjs). Pointing
       * straight at posthog.com would get the requests dropped by ad blockers,
       * which on a developer audience is a large share of readers.
       */
      api_host: "/ingest",
      ui_host: uiHost,

      /**
       * Opts into PostHog's current recommended defaults as a dated set, rather
       * than silently changing behaviour when the SDK updates. Notably this
       * captures pageviews on history changes, which is what makes App Router
       * client-side navigations register without a manual usePathname effect.
       */
      defaults: "2026-05-30",

      // Unhandled errors and promise rejections become Error Tracking issues.
      capture_exceptions: true,

      session_recording: {
        // This site has no forms worth recording, and Giscus runs in a
        // cross-origin iframe that cannot be captured anyway. Masking costs
        // nothing here and keeps the recordings free of anything personal.
        maskAllInputs: true,
      },

      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") ph.debug();
      },
    });
  });
}
