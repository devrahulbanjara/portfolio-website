import { z } from "zod";
import { currentAdmin } from "@/lib/auth";
import { runAdminAgent, adminAgentConfigured, AdminHistory, type AdminEvent } from "@/lib/admin-agent/agent";
import { executeProposal } from "@/lib/admin-agent/tools";
import { ProviderLimitError } from "@/lib/agent/providers/types";
import { logError } from "@/lib/audit";

const Body = z.object({ message: z.string().min(1).max(20_000), history: AdminHistory.default([]) });

/** Streams the admin assistant. Double-guarded: proxy.ts and the session check here. */
/** Streaming answers can take a while (tool calls, model fallbacks). */
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!adminAgentConfigured()) return Response.json({ error: "Add ADMIN_GEMINI_API_KEY to .env.local to enable the admin assistant." }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: AdminEvent) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {}
      };
      try {
        await runAdminAgent({ ...parsed.data, emit, signal: req.signal });
      } catch (err) {
        if (!req.signal.aborted) {
          await logError("server", `admin agent: ${(err as Error).message}`, { stack: (err as Error).stack });
          emit({ type: "error", message: err instanceof ProviderLimitError ? "Gemini is rate-limited right now — try again in a minute." : (err as Error).message.slice(0, 300) });
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}

/** Confirm a proposal the assistant made (publish, edit, delete, settings…). */
export async function PUT(req: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const parsed = z.object({ token: z.string().max(200_000) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  try {
    return Response.json({ ok: true, result: await executeProposal(parsed.data.token) });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
