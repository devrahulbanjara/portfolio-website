import fs from "node:fs/promises";
import path from "node:path";
import { currentAdmin } from "@/lib/auth";
import { UPLOAD_DIR, run } from "@/lib/db";
import { MEDIA_TYPES, MEDIA_MAX_MB, MediaMime, mediaKind } from "@/lib/schemas/content";
import { sniffMedia, mediaFilename } from "@/lib/media";
import { audit } from "@/lib/audit";
import { put } from "@vercel/blob";

/**
 * Upload through the server. Used in development (saves to data/uploads) and
 * for small files. On Vercel, big files go straight from the browser to Blob
 * instead (see ./client) because Vercel caps request bodies at 4.5 MB.
 */
export async function POST(req: Request) {
  // proxy.ts already guards /api/admin, this is the second check
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (!MediaMime.safeParse(file.type).success) return Response.json({ error: "Use PNG, JPEG, WebP, GIF, AVIF, MP4, WebM or MOV" }, { status: 415 });
  const max = MEDIA_MAX_MB[mediaKind(file.type)];
  if (file.size > max * 1024 * 1024) return Response.json({ error: `That file is over ${max} MB` }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const real = sniffMedia(buf);
  if (!real) return Response.json({ error: "That file isn't a supported image or video" }, { status: 415 });

  const filename = mediaFilename(MEDIA_TYPES[real]);
  // Production (Vercel): Vercel Blob, served from its CDN. Development: local disk, served by /uploads.
  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    const blob = await put(`uploads/${filename}`, buf, { access: "public", contentType: real, cacheControlMaxAge: 31536000 });
    url = blob.url;
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buf, { flag: "wx" });
    url = `/uploads/${filename}`;
  }
  await run("INSERT INTO media (id, filename, original_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?)", filename.split(".")[0], filename, file.name.slice(0, 200), real, file.size, Date.now());
  await audit("media.upload", filename, { size: file.size });
  return Response.json({ url, mime: real });
}
