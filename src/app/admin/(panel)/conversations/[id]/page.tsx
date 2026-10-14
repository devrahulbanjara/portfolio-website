import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { chatSession } from "@/lib/admin-data";
import { parseUA } from "@/lib/request";
import { PageHead, Loading, when } from "@/components/admin/ui";

export const metadata = { title: "Conversation" };

const VERDICT: Record<string, { label: string; cls: string }> = {
  ok: { label: "Answered", cls: "ok" },
  declined: { label: "Declined", cls: "info" },
  blocked: { label: "Blocked", cls: "warn" },
  error: { label: "Error", cls: "bad" },
  aborted: { label: "Stopped", cls: "" },
};

export default function ConversationPage({ params }: PageProps<"/admin/conversations/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Conversation params={params} />
    </Suspense>
  );
}

async function Conversation({ params }: Pick<PageProps<"/admin/conversations/[id]">, "params">) {
  await requireAdmin();
  const data = await chatSession((await params).id);
  if (!data) notFound();
  const { session, turns } = data;
  const ua = parseUA(session.user_agent ?? "");

  return (
    <>
      <Link href="/admin/conversations" className="muted" style={{ fontSize: 14 }}>
        ← All conversations
      </Link>
      <PageHead
        title={`Conversation · ${turns.length} ${turns.length === 1 ? "question" : "questions"}`}
        sub={`Started ${when(session.created_at)} · ${session.country ?? "unknown country"} · ${ua.browser} on ${ua.os} (${ua.device}) · opened from ${session.path ?? "/"}`}
      />
      {turns.map((t) => {
        const v = VERDICT[t.verdict] ?? { label: t.verdict, cls: "" };
        return (
          <article key={t.id} className="turn">
            <div className="turn-q">{t.user_message}</div>
            <div className="turn-a">{t.answer ?? <span className="muted">(no answer)</span>}</div>
            <div className="turn-meta">
              <span className={`pill ${v.cls}`}>
                {v.label}
                {t.verdict_reason ? ` · ${t.verdict_reason}` : ""}
              </span>
              {t.model && <span className="pill">{t.model}</span>}
              {t.latency_ms != null && <span className="pill">{(t.latency_ms / 1000).toFixed(2)}s total</span>}
              {t.ttft_ms != null && <span className="pill">first words in {(t.ttft_ms / 1000).toFixed(2)}s</span>}
              {(t.input_tokens ?? 0) + (t.output_tokens ?? 0) > 0 && (
                <span className="pill">
                  {t.input_tokens} in / {t.output_tokens} out tokens
                </span>
              )}
              {t.feedback === 1 && <span className="pill ok">visitor: helpful</span>}
              {t.feedback === -1 && <span className="pill bad">visitor: not helpful</span>}
              <span className="pill">{when(t.ts)}</span>
            </div>
            {t.error && <div className="turn-a" style={{ color: "#b42318" }}>{t.error}</div>}
            {t.steps.length > 0 && (
              <ol className="trace" aria-label="Trace">
                {t.steps.map((s, i) => (
                  <li key={i}>
                    <span className="k">{s.kind}</span>
                    <span>
                      {s.kind === "model" && `${s.model} · ${s.input ?? 0}→${s.output ?? 0} tokens`}
                      {s.kind === "tool" && `${s.name}(${JSON.stringify(s.args)}) → ${s.result}`}
                      {s.kind === "guard" && `${s.name}: ${s.detail}`}
                    </span>
                    <span className="ms">{"ms" in s ? `${s.ms}ms` : ""}</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        );
      })}
    </>
  );
}
