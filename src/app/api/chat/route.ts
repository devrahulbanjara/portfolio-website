import { nanoid } from "nanoid";
import { runAgent, ensureSession } from "@/lib/agent/agent";
import { screenInput, checkRateLimits } from "@/lib/agent/guardrails";
import { readChatSession, newChatSession, clearChatCookie } from "@/lib/agent/chat-session";
import { forget } from "@/lib/agent/memory";
import type { AgentEvent } from "@/lib/agent/types";
import { clientIp, clientCountry, ipHash, visitorHash } from "@/lib/request";
import { run } from "@/lib/db";
import { setting } from "@/lib/settings";
import { ChatRequest } from "@/lib/schemas/chat";

/** Streaming answers can take a while (tool calls, model fallbacks). */
export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = ChatRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { message, path = "/" } = parsed.data;

  // Session identity comes only from our signed cookie — never from the request body.
  let sessionId = readChatSession(req.headers.get("cookie"));
  let setCookie: string | null = null;
  if (!sessionId) {
    const s = newChatSession();
    sessionId = s.id;
    setCookie = s.cookie;
  }
  const sid = sessionId;

  const h = req.headers;
  const ip = clientIp(h);
  const ua = h.get("user-agent") ?? "";
  const iph = ipHash(ip);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: AgentEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {
          /* client went away */
        }
      };

      /** Refusals that never reach a model still produce a traced turn for /admin. */
      const refuse = async (reason: string, text: string) => {
        const turnId = nanoid(12);
        await run(
          "INSERT INTO chat_turns (id, session_id, ts, user_message, answer, verdict, verdict_reason, steps, latency_ms) VALUES (?, ?, ?, ?, ?, 'blocked', ?, ?, 0)",
          turnId,
          sid,
          Date.now(),
          message.slice(0, 2000),
          text,
          reason,
          JSON.stringify([{ kind: "guard", name: reason, detail: "blocked before model" }]),
        );
        emit({ type: "turn", turnId });
        emit({ type: "step", id: "guard", tool: "guardrail", label: `Guardrail(${reason})`, status: "done", detail: "blocked before model" });
        emit({ type: "replace", text });
        emit({ type: "done", turnId, ms: 0 });
      };

      try {
        await ensureSession(sid, { visitorId: visitorHash(ip, ua), ipHash: iph, country: clientCountry(h), ua, path });

        if (!(await setting("chat_enabled"))) {
          await refuse("disabled", "The assistant is offline right now. Everything it knows is on this site — or just email Rahul.");
        } else {
          const input = screenInput(message);
          if (!input.ok) await refuse(input.reason, input.message);
          else {
            const rl = await checkRateLimits(iph);
            if (!rl.ok) await refuse(rl.reason, rl.message);
            else await runAgent({ sessionId: sid, message: message.trim(), flags: input.flags, emit, signal: req.signal });
          }
        }
      } catch (err) {
        console.error(err);
        emit({ type: "error", message: "Something went wrong." });
      } finally {
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  if (setCookie) headers.append("Set-Cookie", setCookie);
  return new Response(stream, { headers });
}

/** "New conversation": drop RAM memory and rotate the session cookie. */
export async function DELETE(req: Request) {
  const sid = readChatSession(req.headers.get("cookie"));
  if (sid) forget(sid);
  return new Response(null, { status: 204, headers: { "Set-Cookie": clearChatCookie() } });
}
