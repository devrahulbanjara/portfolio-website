import "server-only";
import { ProviderLimitError, type NeutralMessage, type Provider, type StepInput, type StepResult, type ToolCall } from "./types";

/** Groq via its OpenAI-compatible API, using plain fetch + SSE parsing (no SDK dependency). */
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
const URL = "https://api.groq.com/openai/v1/chat/completions";

type OAIMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string };

function toMessages(system: string, messages: NeutralMessage[]): OAIMessage[] {
  const out: OAIMessage[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (m.role === "user") out.push({ role: "user", content: m.text });
    else if (m.role === "assistant")
      out.push({
        role: "assistant",
        content: m.text || null,
        ...(m.toolCalls.length
          ? { tool_calls: m.toolCalls.map((c) => ({ id: c.id, type: "function" as const, function: { name: c.name, arguments: JSON.stringify(c.args) } })) }
          : {}),
      });
    else for (const r of m.results) out.push({ role: "tool", tool_call_id: r.id, content: JSON.stringify(r.result) });
  }
  return out;
}

/** Parses Groq durations like "2m59.56s", "7.66s", "120ms". */
function parseDuration(s: string | null): number | null {
  if (!s) return null;
  let ms = 0;
  const re = /(\d+(?:\.\d+)?)(ms|h|m|s)/g;
  let m: RegExpExecArray | null;
  let any = false;
  while ((m = re.exec(s))) {
    any = true;
    const v = Number(m[1]);
    ms += m[2] === "h" ? v * 3600_000 : m[2] === "m" ? v * 60_000 : m[2] === "s" ? v * 1000 : v;
  }
  return any ? ms : null;
}

export const groq: Provider = {
  id: "groq",
  model: MODEL,
  configured: () => !!process.env.GROQ_API_KEY,

  async step({ system, messages, tools, signal, onText, onChunk }: StepInput): Promise<StepResult> {
    const res = await fetch(URL, {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: toMessages(system, messages),
        tools: tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })),
        tool_choice: "auto",
        temperature: 0.4,
        max_completion_tokens: 900,
        stream: true,
        stream_options: { include_usage: true },
        ...(MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
    });

    if (res.status === 429 || res.status === 503 || res.status === 498) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const resetReq = parseDuration(res.headers.get("x-ratelimit-reset-requests"));
      const remainingReq = Number(res.headers.get("x-ratelimit-remaining-requests") ?? "1");
      const isDay = remainingReq === 0 && resetReq !== null;
      const wait = isDay ? resetReq! : Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 30_000;
      throw new ProviderLimitError("groq", res.status, Date.now() + wait + 500, res.status === 429 ? (isDay ? "day" : "minute") : "overload");
    }
    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      throw new Error(`groq ${res.status}: ${body.slice(0, 500)}`);
    }

    let text = "";
    const calls = new Map<number, { id: string; name: string; args: string }>();
    let usage = { input: 0, output: 0, thoughts: 0 };
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let stopped = false;

    while (!stopped) {
      const { value, done } = await reader.read();
      if (done) break;
      onChunk?.();
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        let json: {
          choices?: { delta?: { content?: string | null; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number; completion_tokens_details?: { reasoning_tokens?: number } };
          x_groq?: { usage?: { prompt_tokens?: number; completion_tokens?: number } };
        };
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }
        const u = json.usage ?? json.x_groq?.usage;
        if (u) usage = { input: u.prompt_tokens ?? 0, output: u.completion_tokens ?? 0, thoughts: json.usage?.completion_tokens_details?.reasoning_tokens ?? 0 };
        const delta = json.choices?.[0]?.delta;
        if (!delta) continue;
        if (delta.content) {
          text += delta.content;
          if (!onText(delta.content)) {
            stopped = true;
            break;
          }
        }
        for (const tc of delta.tool_calls ?? []) {
          const cur = calls.get(tc.index) ?? { id: "", name: "", args: "" };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name += tc.function.name;
          if (tc.function?.arguments) cur.args += tc.function.arguments;
          calls.set(tc.index, cur);
        }
      }
    }
    if (stopped) await reader.cancel().catch(() => {});

    const toolCalls: ToolCall[] = [...calls.values()].map((c, i) => {
      let args: Record<string, unknown> = {};
      try {
        args = c.args ? JSON.parse(c.args) : {};
      } catch {}
      return { id: c.id || `q${i}`, name: c.name, args };
    });

    return { text, toolCalls, usage, model: MODEL };
  },
};
