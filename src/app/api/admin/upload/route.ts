import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { currentAdmin } from "@/lib/auth";
import { UPLOAD_DIR, run } from "@/lib/db";
import { ImageMime } from "@/lib/schemas/content";
import { audit } from "@/lib/audit";
import { put } from "@vercel/blob";

const MAX_BYTES = (Number(process.env.UPLOAD_MAX_MB) || 8) * 1024 * 1024;
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

/** Check the file really is the image type it claims to be (magic bytes). SVG is refused: it can carry scripts. */
function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(0, 6).toString() === "GIF87a" || buf.subarray(0, 6).toString() === "GIF89a") return "image/gif";
  if (buf.subarray(4, 12).toString() === "ftypavif") return "image/avif";
  return null;
}

export async function POST(req: Request) {
  // proxy.ts already guards /api/admin, this is the second check
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: `Images must be under ${MAX_BYTES / 1024 / 1024} MB` }, { status: 413 });
  if (!ImageMime.safeParse(file.type).success || file.type === "image/svg+xml") return Response.json({ error: "Use PNG, JPEG, WebP, GIF or AVIF" }, { status: 415 });

  const buf = Buffer.from(await file.arrayBuffer());
  const real = sniff(buf);
  if (!real) return Response.json({ error: "That file isn't a valid image" }, { status: 415 });

  const id = crypto.randomBytes(9).toString("base64url");
  const filename = `${new Date().toISOString().slice(0, 7)}-${id}.${EXT[real]}`;
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
  await run("INSERT INTO media (id, filename, original_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?)", id, filename, file.name.slice(0, 200), real, file.size, Date.now());
  await audit("media.upload", filename, { size: file.size });
  return Response.json({ url });
}
