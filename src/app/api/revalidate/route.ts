import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * Hashnode webhook target. Configure at:
 *   Hashnode dashboard -> Settings -> Webhooks -> https://<site>/api/revalidate
 *
 * Authenticated with a shared secret rather than left open, because an
 * unauthenticated revalidate endpoint is a free cache-stampede lever for anyone
 * who finds it.
 *
 * Accepts the secret as `?secret=` or an `x-webhook-secret` header, since
 * Hashnode's webhook UI does not always allow custom headers.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return Response.json(
      { revalidated: false, reason: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }

  const provided =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-webhook-secret");

  if (provided !== expected) {
    // Deliberately vague: do not confirm whether the secret exists.
    return Response.json({ revalidated: false }, { status: 401 });
  }

  // Next 16 requires a cache profile as the second argument. "max" expires the
  // entry immediately so the next request refetches from Hashnode.
  revalidateTag("blog", "max");

  return Response.json({
    revalidated: true,
    // Timestamp is generated server-side, not trusted from the payload.
    at: new Date().toISOString(),
  });
}
