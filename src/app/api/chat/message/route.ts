import { nanoid } from "nanoid";
import { run } from "@/lib/db";
import { readChatSession } from "@/lib/agent/chat-session";
import { hit } from "@/lib/agent/guardrails";
import { ChatMessageSend } from "@/lib/schemas/chat";
import { clientIp, clientCountry, ipHash } from "@/lib/request";

/**
 * A visitor sends the message the assistant drafted. The model can never call
 * this — only the visitor's click on the card does. Requires a real chat
 * session, validates every field, and is rate limited per session and per IP.
 */
export async function POST(req: Request) {
  const sid = readChatSession(req.headers.get("cookie"));
  if (!sid) return Response.json({ ok: false, error: "Start a chat first." }, { status: 401 });

  const parsed = ChatMessageSend.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return Response.json({ ok: false, errors }, { status: 400 });
  }
  const iph = ipHash(clientIp(req.headers));
  if (!(await hit(`chatmsg:sess:${sid}`, 1, 10 * 60_000)) || !(await hit(`chatmsg:ip:${iph}`, 5, 24 * 3600_000)))
    return Response.json({ ok: false, error: "Rahul already has your message — he'll reply soon." }, { status: 429 });

  const d = parsed.data;
  await run(
    "INSERT INTO contact_messages (id, ts, name, email, topic, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    nanoid(12),
    Date.now(),
    d.name,
    d.email,
    "chat",
    `[${d.topic}] ${d.message}`,
    iph,
  );
  await run("INSERT INTO events (ts, name, path, session_id, props) VALUES (?, 'chat_message_sent', '/', ?, ?)", Date.now(), sid, JSON.stringify({ topic: d.topic, country: clientCountry(req.headers) }));
  return Response.json({ ok: true });
}
