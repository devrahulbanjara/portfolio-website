import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { head, del } from "@vercel/blob";
import { z } from "zod";
import { currentAdmin } from "@/lib/auth";
import { run } from "@/lib/db";
import { MEDIA_TYPES, MEDIA_MAX_MB, MediaMime } from "@/lib/schemas/content";
import { sniffMedia } from "@/lib/media";
import { audit } from "@/lib/audit";

/**
 * Direct browser → Vercel Blob uploads (no 4.5 MB request limit).
 * POST issues a short-lived upload token for an admin; PUT records the
 * finished upload after checking the stored file's real bytes.
 */
/** Tells the editor whether direct uploads are available (they need a Blob store). */
export async function GET() {
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ direct: !!process.env.BLOB_READ_WRITE_TOKEN });
}

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "local" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return Response.json({ error: "bad request" }, { status: 400 });
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await currentAdmin())) throw new Error("unauthorized");
        if (!/^uploads\/[\w.-]+$/.test(pathname)) throw new Error("bad path");
        return {
          allowedContentTypes: Object.keys(MEDIA_TYPES),
          maximumSizeInBytes: MEDIA_MAX_MB.video * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 31536000,
          validUntil: Date.now() + 15 * 60_000,
        };
      },
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

const Done = z.object({ url: z.url(), name: z.string().max(200).default("") });

export async function PUT(req: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Done.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { url, name } = parsed.data;

  // head() only resolves for blobs in this project's own store.
  const blob = await head(url).catch(() => null);
  if (!blob || !blob.pathname.startsWith("uploads/")) return Response.json({ error: "Unknown file" }, { status: 400 });

  const first = new Uint8Array(await (await fetch(blob.url, { headers: { Range: "bytes=0-63" } })).arrayBuffer());
  const real = sniffMedia(first);
  const max = real ? MEDIA_MAX_MB[real.startsWith("video/") ? "video" : "image"] : 0;
  if (!real || !MediaMime.safeParse(real).success || blob.size > max * 1024 * 1024) {
    await del(blob.url).catch(() => {});
    return Response.json({ error: real ? `That file is over ${max} MB` : "That file isn't a supported image or video" }, { status: 415 });
  }
  const filename = blob.pathname.slice("uploads/".length);
  await run(
    "INSERT INTO media (id, filename, original_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
    filename.split(".")[0].slice(0, 64),
    filename,
    name.slice(0, 200),
    real,
    blob.size,
    Date.now(),
  );
  await audit("media.upload", filename, { size: blob.size, direct: true });
  return Response.json({ url: blob.url, mime: real });
}
