import { z } from "zod";

/** POST /api/chat */
export const ChatRequest = z.object({
  message: z.string().max(4000),
  path: z.string().max(200).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequest>;

/** POST /api/chat/feedback */
export const FeedbackRequest = z.object({
  turnId: z.string().min(1).max(40),
  value: z.union([z.literal(1), z.literal(-1)]),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequest>;

/* ── tool argument schemas: model output is untrusted, validate before use ── */

export const CardKind = z.enum(["project", "experience", "certifications", "contact", "services", "post", "teaching", "message"]);
export type CardKind = z.infer<typeof CardKind>;

export const ToolArgs = {
  search_knowledge: z.object({ query: z.string().min(1).max(200) }),
  read_file: z.object({ path: z.string().min(1).max(200) }),
  show_card: z.object({ kind: CardKind, id: z.string().max(120).optional() }),
  navigate: z.object({ path: z.string().max(200) }),
  draft_message: z.object({
    message: z.string().trim().min(1).max(2000),
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().max(200).optional(),
    topic: z.enum(["hiring", "project", "training", "other"]).catch("other").optional(),
  }),
  decline: z.object({ reason: z.enum(["off_topic", "harmful", "private_info", "prompt_injection"]).catch("off_topic") }),
} as const;
export type ToolName = keyof typeof ToolArgs;
export const isToolName = (n: string): n is ToolName => n in ToolArgs;

/* ── persisted trace step (chat_turns.steps JSON) ── */

export const TraceStep = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("model"),
    model: z.string(),
    ms: z.number(),
    input: z.number().optional(),
    output: z.number().optional(),
    thoughts: z.number().optional(),
  }),
  z.object({ kind: z.literal("tool"), name: z.string(), args: z.unknown(), ms: z.number(), result: z.string() }),
  z.object({ kind: z.literal("guard"), name: z.string(), detail: z.string() }),
]);
export type TraceStep = z.infer<typeof TraceStep>;
export const TraceSteps = z.array(TraceStep).catch([]);

export const Verdict = z.enum(["ok", "declined", "blocked", "error", "aborted"]);
export type Verdict = z.infer<typeof Verdict>;

/** POST /api/chat/message — a visitor sends the message the assistant drafted. */
export const ChatMessageSend = z.object({
  name: z.string().trim().min(1, "Your name, please").max(100),
  email: z.email("That email doesn't look right").max(200),
  topic: z.enum(["hiring", "project", "training", "other"]).catch("other"),
  message: z.string().trim().min(10, "A little more detail helps (10+ characters)").max(5000),
});
