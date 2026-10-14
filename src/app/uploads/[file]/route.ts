import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif" };

/** Serves uploaded images from the data volume. Filenames are random and immutable, so cache forever. */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w-]+\.(png|jpg|webp|gif|avif)$/.test(file)) return new Response("Not found", { status: 404 });
  const full = path.join(UPLOAD_DIR, file);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[file.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
