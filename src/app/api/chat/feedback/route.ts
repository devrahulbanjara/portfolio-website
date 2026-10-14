import { run } from "@/lib/db";
import { readChatSession } from "@/lib/agent/chat-session";
import { FeedbackRequest } from "@/lib/schemas/chat";

export async function POST(req: Request) {
  const sid = readChatSession(req.headers.get("cookie"));
  const parsed = FeedbackRequest.safeParse(await req.json().catch(() => null));
  if (!sid || !parsed.success) return Response.json({ ok: false }, { status: 400 });
  // Scoped to the caller's own session — can't rate someone else's turn.
  await run("UPDATE chat_turns SET feedback = ? WHERE id = ? AND session_id = ?", parsed.data.value, parsed.data.turnId, sid);
  return Response.json({ ok: true });
}
