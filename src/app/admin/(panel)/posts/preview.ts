"use server";

import { requireAdmin } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

/** Render markdown with the exact pipeline the public blog uses (admin only). */
export async function previewMarkdown(md: string) {
  await requireAdmin();
  if (md.length > 400_000) return "<p>Too long to preview.</p>";
  return (await renderMarkdown(md)).html;
}
