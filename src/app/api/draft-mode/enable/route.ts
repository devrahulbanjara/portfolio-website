import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

/**
 * Called by the Presentation tool to turn on Draft Mode for the editor's own
 * browser session.
 *
 * defineEnableDraftMode validates the request against a live Studio session
 * before setting the cookie, so this is not an open door to unpublished
 * content — but it does need a token that can read drafts, which is why the
 * route must run on Node and must never be cached.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enabled = client !== null && readToken !== "";

const handler = enabled
  ? defineEnableDraftMode({ client: client!.withConfig({ token: readToken }) })
      .GET
  : async () =>
      new Response(
        "Draft mode is unavailable: set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_READ_TOKEN.",
        { status: 501 },
      );

export const GET = handler;
