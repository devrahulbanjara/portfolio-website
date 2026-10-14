import { z } from "zod";

/* ── Blog posts (admin editor → server action) ───────────────────── */

export const PostStatus = z.enum(["draft", "published", "scheduled"]);
export type PostStatus = z.infer<typeof PostStatus>;

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((s) => s.trim() || null)
    .nullable()
    .optional();

export const PostInput = z
  .object({
    id: z.string().max(40).optional(),
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z
      .string()
      .trim()
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Slug: lowercase letters, numbers and hyphens")
      .default(""),
    excerpt: z.string().trim().max(400).default(""),
    content: z.string().max(400_000).default(""),
    coverUrl: optionalText(500),
    coverAlt: optionalText(200),
    tags: z
      .array(z.string().trim().toLowerCase().min(1).max(32))
      .max(12)
      .default([])
      .transform((t) => [...new Set(t)]),
    status: PostStatus.default("draft"),
    featured: z.boolean().default(false),
    publishedAt: z.number().int().positive().nullable().optional(),
    seoTitle: optionalText(120),
    seoDescription: optionalText(200),
    canonicalUrl: z.union([z.url().max(500), z.literal(""), z.null()]).optional().transform((v) => v || null),
  })
  .refine((p) => p.status !== "scheduled" || (p.publishedAt && p.publishedAt > Date.now()), {
    message: "Scheduled posts need a publish time in the future",
    path: ["publishedAt"],
  });
export type PostInput = z.infer<typeof PostInput>;

/* ── Public forms ────────────────────────────────────────────────── */

export const ContactInput = z.object({
  name: z.string().trim().min(1, "Your name, please").max(100),
  email: z.email("That email doesn't look right").max(200),
  topic: z.enum(["hiring", "project", "training", "other"]).default("other"),
  message: z.string().trim().min(10, "A little more detail helps (10+ characters)").max(5000),
  /** honeypot — real people never fill this */
  website: z.string().max(0).optional().or(z.literal("")),
  /** ms the form was open; bots submit instantly */
  elapsed: z.coerce.number().int().min(1500, "Please take a moment before sending").optional(),
});
export type ContactInput = z.infer<typeof ContactInput>;

export const GuestbookInput = z.object({
  name: z.string().trim().min(1).max(40),
  message: z.string().trim().min(2).max(280),
  website: z.string().max(0).optional().or(z.literal("")),
});
export type GuestbookInput = z.infer<typeof GuestbookInput>;

/* ── Uploads ─────────────────────────────────────────────────────── */

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif", "image/svg+xml"] as const;
export const ImageMime = z.enum(ALLOWED_IMAGE_TYPES);

/** What can go into a post: images (incl. GIF) and short videos. SVG is never accepted — it can carry scripts. */
export const MEDIA_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
} as const;
export type MediaMime = keyof typeof MEDIA_TYPES;
export const MediaMime = z.enum(Object.keys(MEDIA_TYPES) as [MediaMime, ...MediaMime[]]);
export const MEDIA_MAX_MB = { image: 25, video: 200 } as const;
export const mediaKind = (mime: string) => (mime.startsWith("video/") ? "video" : "image");
