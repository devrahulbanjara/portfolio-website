import { z } from "zod";

const sid = z.string().min(6).max(40);
const path = z.string().max(300);

/** POST /api/t — discriminated on `k`, like a tagged union of dataclasses. */
export const TrackPayload = z.discriminatedUnion("k", [
  z.object({
    k: z.literal("pv"),
    sid,
    path,
    title: z.string().max(300).optional(),
    ref: z.string().max(1000).optional(),
    screen: z.string().max(20).optional(),
    lang: z.string().max(20).optional(),
    tz: z.string().max(60).optional(),
  }),
  z.object({ k: z.literal("ping"), id: z.number().int().positive(), sid, ms: z.number().int().min(0).max(6 * 3600_000), scroll: z.number().int().min(0).max(100) }),
  z.object({ k: z.literal("ev"), sid, name: z.string().regex(/^[a-z0-9_.:-]{1,60}$/), path, props: z.record(z.string(), z.union([z.string().max(200), z.number(), z.boolean()])).optional() }),
  z.object({ k: z.literal("vital"), path, name: z.enum(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]), value: z.number().finite(), rating: z.enum(["good", "needs-improvement", "poor"]).optional() }),
  z.object({ k: z.literal("err"), path, message: z.string().max(2000), stack: z.string().max(8000).optional() }),
]);
export type TrackPayload = z.infer<typeof TrackPayload>;

/** Admin analytics query params. */
export const RangeParam = z.enum(["24h", "7d", "30d", "90d"]).catch("7d");
export type Range = z.infer<typeof RangeParam>;
export const RANGE_MS: Record<Range, number> = { "24h": 86400_000, "7d": 7 * 86400_000, "30d": 30 * 86400_000, "90d": 90 * 86400_000 };
