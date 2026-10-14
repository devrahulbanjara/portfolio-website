"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAgent, type UiStep, type UiTurn } from "./AgentProvider";
import { MiniMarkdown } from "./MiniMarkdown";
import { AgentCard } from "./Cards";
import { AgentMark } from "./AgentMark";
import { agentSuggestions, projects, experience } from "@/content/profile";
import "./studio.css";

/** Turn a tool step into a sentence a visitor understands. */
function friendly(s: UiStep): string {
  const arg = /\((.*)\)$/.exec(s.label)?.[1]?.replace(/^"|"$/g, "") ?? "";
  switch (s.tool) {
    case "search_knowledge":
      return `Searched for “${arg}”`;
    case "read_file": {
      const proj = /^projects\/(.+)\.md$/.exec(arg)?.[1];
      if (proj) return `Read the ${projects.find((p) => p.slug === proj)?.title ?? proj} project`;
      const xp = /^experience\/(.+)\.md$/.exec(arg)?.[1];
      if (xp) return `Read about his role at ${experience.find((e) => e.id === xp)?.company ?? xp}`;
      const map: Record<string, string> = {
        "about.md": "Read his bio",
        "contact.md": "Checked his availability",
        "teaching.md": "Read about his teaching",
        "certifications.md": "Checked his certifications",
        "services.md": "Read how to work with him",
        "skills.md": "Looked at his skills",
        "testimonials.md": "Read what people say about him",
        "now.md": "Checked what he's doing now",
        "blog/index.md": "Looked through his writing",
      };
      return map[arg] ?? `Read ${arg}`;
    }
    case "show_card":
      return "Prepared a card for you";
    case "draft_message":
      return "Drafted a message for you to send";
    case "navigate":
      return `Opening ${arg}`;
    case "decline":
    case "guardrail":
      return "Kept the conversation about Rahul";
    case "router":
      return s.label.startsWith("Wait") ? (s.status === "running" ? "Waiting a moment for the model…" : "Model ready again") : "Switched to a backup model";
    default:
      return s.label;
  }
}

export function StudioConsole() {
  const { open, setOpen, turns, busy, ask, stop, reset, rate, draft, setDraft } = useAgent();
  const pathname = usePathname();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = pathname.startsWith("/teaching")
    ? ["What does Rahul teach?", "Can he train my team?", "How does he prepare people for AWS certs?"]
    : agentSuggestions.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 500);
    return () => clearTimeout(t);
  }, [open]);

  const last = turns[turns.length - 1];
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [last?.text, last?.steps.length, last?.cards.length, turns.length]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [draft]);

  const submit = () => {
    if (draft.trim() && !busy) ask(draft);
  };

  return (
    <>
      <div className={`st-scrim ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden />
      <aside className={`st-panel ${open ? "is-open" : ""} ${busy ? "is-busy" : ""}`} role="dialog" aria-label="Ask Rahul's AI assistant" aria-hidden={!open} inert={!open}>
        <svg className="st-curve" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden>
          <path />
        </svg>

        <header className="st-head">
          <div className="st-head-left">
            <AgentMark active={busy} size={20} />
            <span>Ask my assistant</span>
          </div>
          <div className="st-head-right">
            {turns.length > 0 && (
              <button type="button" className="st-text-btn" onClick={reset}>
                New chat
              </button>
            )}
            <button type="button" className="st-close" onClick={() => setOpen(false)} aria-label="Close">
              <span />
              <span />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="st-body" data-lenis-prevent>
          {turns.length === 0 ? (
            <div className="st-empty">
              <p className="st-kicker">Try asking</p>
              <ul className="st-suggest">
                {suggestions.map((s, i) => (
                  <li key={s} style={{ ["--i" as string]: i }}>
                    <button type="button" onClick={() => ask(s)} data-ev="agent_suggestion">
                      <AgentMark active={false} size={16} />
                      <span className="st-suggest-text">{s}</span>
                      <svg className="st-suggest-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M4 12L12 4M6 4h6v6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="st-note">I answer questions about Rahul — his work, teaching and how to hire him — using what&apos;s on this site.</p>
            </div>
          ) : (
            <ol className="st-turns">
              {turns.map((t) => (
                <StudioTurn key={t.key} t={t} onRate={(v) => rate(t.key, v)} onRetry={() => ask(t.user)} />
              ))}
            </ol>
          )}
        </div>

        <form
          className="st-input"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={600}
            placeholder="Ask anything about Rahul…"
            aria-label="Your question"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          {busy ? (
            <button type="button" className="st-send" onClick={stop} aria-label="Stop">
              <span className="st-stop" />
            </button>
          ) : (
            <button type="submit" className="st-send" disabled={!draft.trim()} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 13V3M4 7l4-4 4 4" />
              </svg>
            </button>
          )}
        </form>
      </aside>
    </>
  );
}

function StudioTurn({ t, onRate, onRetry }: { t: UiTurn; onRate: (v: 1 | -1) => void; onRetry: () => void }) {
  const [copied, setCopied] = useState(false);
  const streaming = t.status === "streaming";
  const thinking = streaming && !t.text && !t.cards.length;

  return (
    <li className="st-turn">
      <p className="st-question">{t.user}</p>

      {t.steps.length > 0 && (
        <ul className="st-steps" aria-label="What the assistant did">
          {t.steps.map((s) => (
            <li key={s.id} className={`is-${s.status}`}>
              <span className="st-step-dot" />
              {friendly(s)}
            </li>
          ))}
        </ul>
      )}

      {thinking && (
        <p className="st-thinking">
          <AgentMark active size={18} />
          <span className="ga-text">Thinking…</span>
        </p>
      )}

      {t.text && (
        <div className="st-answer">
          <MiniMarkdown text={t.text} caret={streaming} />
        </div>
      )}

      {t.cards.length > 0 && (
        <div className="st-cards">
          {t.cards.map((c, i) => (
            <AgentCard key={i} card={c} />
          ))}
        </div>
      )}

      {t.status === "error" && (
        <div className="st-error">
          <p>{t.error}</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {t.status === "done" && t.text && (
        <div className="st-meta">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(t.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {t.turnId && (
            <>
              <button type="button" onClick={() => onRate(1)} className={t.feedback === 1 ? "is-on" : ""} aria-pressed={t.feedback === 1}>
                Helpful
              </button>
              <button type="button" onClick={() => onRate(-1)} className={t.feedback === -1 ? "is-on" : ""} aria-pressed={t.feedback === -1}>
                Not helpful
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
