"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AgentMark } from "@/components/agent/AgentMark";
import { MiniMarkdown } from "@/components/agent/MiniMarkdown";
import type { AdminEvent } from "@/lib/admin-agent/agent";

type Step = { id: string; label: string; status: "running" | "done" | "error"; detail?: string };
type Confirm = { token: string; title: string; detail: string; danger: boolean; state: "pending" | "working" | "done" | "dismissed" | "error"; note?: string };
type Turn = { key: string; user: string; text: string; steps: Step[]; confirms: Confirm[]; links: { href: string; label: string }[]; status: "streaming" | "done" | "error"; error?: string; meta?: string };

const STORE = "admin_assistant_v1";
const SUGGESTIONS = [
  "How did the site do this week?",
  "Summarise my unread messages",
  "What are visitors asking the assistant, and where did it struggle?",
  "Draft a blog post about what I learned building RAG systems",
  "Which pages keep people reading the longest?",
];

export function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) setTurns((JSON.parse(raw) as Turn[]).map((t) => ({ ...t, status: t.status === "streaming" ? "done" : t.status })));
    } catch {}
  }, []);
  useEffect(() => {
    if (!busy)
      try {
        sessionStorage.setItem(STORE, JSON.stringify(turns.slice(-20)));
      } catch {}
  }, [turns, busy]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 350);
  }, [open]);
  const last = turns[turns.length - 1];
  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [last?.text, last?.steps.length, last?.confirms.length, turns.length]);

  const patch = (key: string, fn: (t: Turn) => Turn) => setTurns((ts) => ts.map((t) => (t.key === key ? fn(t) : t)));

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    setBusy(true);
    setOpen(true);
    const key = crypto.randomUUID();
    const history = turns
      .filter((t) => t.status === "done" && t.text)
      .slice(-10)
      .flatMap((t) => [
        { role: "user" as const, text: t.user },
        { role: "assistant" as const, text: t.text },
      ]);
    setTurns((ts) => [...ts, { key, user: q, text: "", steps: [], confirms: [], links: [], status: "streaming" }]);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/admin/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, history }), signal: ctrl.signal });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({})))?.error ?? `HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 2);
          if (!line.startsWith("data: ")) continue;
          const ev = JSON.parse(line.slice(6)) as AdminEvent;
          if (ev.type === "delta") patch(key, (t) => ({ ...t, text: t.text + ev.text }));
          else if (ev.type === "step")
            patch(key, (t) => {
              const s: Step = { id: ev.id, label: ev.label, status: ev.status, detail: ev.detail };
              const at = t.steps.findIndex((x) => x.id === ev.id);
              return { ...t, steps: at >= 0 ? t.steps.map((x, j) => (j === at ? s : x)) : [...t.steps, s] };
            });
          else if (ev.type === "confirm") patch(key, (t) => ({ ...t, confirms: [...t.confirms, { token: ev.token, title: ev.title, detail: ev.detail, danger: ev.danger, state: "pending" }] }));
          else if (ev.type === "link") patch(key, (t) => ({ ...t, links: [...t.links, { href: ev.href, label: ev.label }] }));
          else if (ev.type === "done") patch(key, (t) => ({ ...t, status: "done", meta: `${ev.model} · ${(ev.ms / 1000).toFixed(1)}s · ${(ev.tokens.input + ev.tokens.output).toLocaleString()} tokens` }));
          else if (ev.type === "error") patch(key, (t) => ({ ...t, status: "error", error: ev.message }));
        }
      }
      patch(key, (t) => (t.status === "streaming" ? { ...t, status: "done" } : t));
      router.refresh();
    } catch (e) {
      patch(key, (t) => ({ ...t, status: (e as Error).name === "AbortError" ? "done" : "error", error: (e as Error).name === "AbortError" ? undefined : (e as Error).message }));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  const decide = async (turnKey: string, token: string, yes: boolean) => {
    const set = (state: Confirm["state"], note?: string) => patch(turnKey, (t) => ({ ...t, confirms: t.confirms.map((c) => (c.token === token ? { ...c, state, note } : c)) }));
    if (!yes) return set("dismissed");
    set("working");
    const res = await fetch("/api/admin/agent", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (body.ok) {
      set("done");
      router.refresh();
    } else set("error", body.error ?? "Failed");
  };

  return (
    <>
      <button type="button" className="aa-launch" onClick={() => setOpen(true)} aria-label="Open admin assistant (⌘K)">
        <AgentMark active={busy} size={18} /> Ask AI <span className="aa-kbd">⌘K</span>
      </button>
      <div className={`aa-scrim ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden />
      <aside className={`aa-panel ${open ? "is-open" : ""} ${busy ? "is-busy" : ""}`} aria-label="Admin assistant" aria-hidden={!open} inert={!open}>
        <header className="aa-head">
          <span className="aa-title">
            <AgentMark active={busy} size={20} /> Admin assistant
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            {turns.length > 0 && (
              <button type="button" className="aa-ghost" onClick={() => (abort.current?.abort(), setTurns([]))}>
                New chat
              </button>
            )}
            <button type="button" className="aa-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </span>
        </header>
        <div ref={scroll} className="aa-body">
          {turns.length === 0 ? (
            <div className="aa-empty">
              <p className="aa-hello">Hi Rahul — what do you need?</p>
              <p className="aa-sub">I can read your analytics, messages, visitor chats and logs, run custom queries, and write or manage blog posts. Big changes always wait for your confirmation.</p>
              <ul>
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => ask(s)}>
                      <AgentMark active={false} size={14} />
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            turns.map((t) => (
              <article key={t.key} className="aa-turn">
                <p className="aa-q">{t.user}</p>
                {t.steps.length > 0 && (
                  <ul className="aa-steps">
                    {t.steps.map((s) => (
                      <li key={s.id} className={`is-${s.status}`} title={s.detail}>
                        <span className="aa-dot" />
                        {s.label}
                        {s.detail && s.status !== "running" && <em> → {s.detail}</em>}
                      </li>
                    ))}
                  </ul>
                )}
                {t.status === "streaming" && !t.text && (
                  <p className="aa-thinking">
                    <AgentMark active size={16} /> <span className="ga-text">Working…</span>
                  </p>
                )}
                {t.text && (
                  <div className="aa-answer">
                    <MiniMarkdown text={t.text} caret={t.status === "streaming"} />
                  </div>
                )}
                {t.confirms.map((c) => (
                  <div key={c.token} className={`aa-confirm ${c.danger ? "is-danger" : ""} is-${c.state}`}>
                    <div>
                      <strong>{c.title}</strong>
                      <p>{c.detail}</p>
                      {c.note && <p className="aa-err">{c.note}</p>}
                    </div>
                    {c.state === "pending" || c.state === "error" ? (
                      <span className="aa-confirm-actions">
                        <button type="button" className="aa-ghost" onClick={() => decide(t.key, c.token, false)}>
                          Dismiss
                        </button>
                        <button type="button" className={`aa-go ${c.danger ? "danger" : ""}`} onClick={() => decide(t.key, c.token, true)}>
                          Confirm
                        </button>
                      </span>
                    ) : (
                      <span className="aa-state">{c.state === "working" ? "Working…" : c.state === "done" ? "✓ Done" : "Dismissed"}</span>
                    )}
                  </div>
                ))}
                {t.links.map((l) => (
                  <Link key={l.href} href={l.href} className="aa-link" onClick={() => setOpen(false)}>
                    {l.label} →
                  </Link>
                ))}
                {t.error && <p className="aa-err">{t.error}</p>}
                {t.meta && <p className="aa-meta">{t.meta}</p>}
              </article>
            ))
          )}
        </div>
        <form
          className="aa-input"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(draft);
          }}
        >
          <textarea
            ref={input}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(draft);
              }
            }}
            placeholder="Ask about your site, or ask me to write a post…"
            aria-label="Message the admin assistant"
          />
          {busy ? (
            <button type="button" className="aa-send" onClick={() => abort.current?.abort()} aria-label="Stop">
              ■
            </button>
          ) : (
            <button type="submit" className="aa-send" disabled={!draft.trim()} aria-label="Send">
              ↑
            </button>
          )}
        </form>
      </aside>
    </>
  );
}
