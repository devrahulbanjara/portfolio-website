import { draftMode } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escape hatch for when Draft Mode gets stuck on in a browser. */
export async function GET(request: Request) {
  (await draftMode()).disable();

  const url = new URL(request.url);
  return Response.redirect(new URL(url.searchParams.get("to") || "/", url), 307);
}
