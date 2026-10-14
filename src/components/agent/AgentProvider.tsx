"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentEvent, CardKind } from "@/lib/agent/types";
import { track } from "@/components/site/Analytics";

export type UiStep = { id: string; tool: string; label: string; status: "running" | "done" | "error"; detail?: string; ms?: number };
export type UiCard = { kind: CardKind; id?: string; data?: Record<string, string> };
export type UiTurn = {
  key: string;
  turnId?: string;
  user: string;
  steps: UiStep[];
  cards: UiCard[];
  text: string;
  status: "streaming" | "done" | "error";
  error?: string;
  meta?: { model?: string; ms: number; tokens?: { input: number; output: number } };
  navigateTo?: string;
  feedback?: 1 | -1;
};

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  turns: UiTurn[];
  busy: boolean;
  ask: (text: string) => void;
  stop: () => void;
  reset: () => void;
  rate: (key: string, v: 1 | -1) => void;
  draft: string;
  setDraft: (s: string) => void;
};

const AgentCtx = createContext<Ctx | null>(null);
export const useAgent = () => {
  const c = useContext(AgentCtx);
  if (!c) throw new Error("useAgent outside provider");
  return c;
};

const STORE_KEY = "rdb_agent_turns";

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [turns, setTurns] = useState<UiTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // Restore this tab's transcript (UI only — the server keeps its own short memory).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from sessionStorage once
      if (raw) setTurns((JSON.parse(raw) as UiTurn[]).map((t) => (t.status === "streaming" ? { ...t, status: "done" } : t)));
    } catch {}
  }, []);
  useEffect(() => {
    if (busy) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(turns.slice(-12)));
    } catch {}
  }, [turns, busy]);

  const setOpen = useCallback((v: boolean) => {
    setOpenState(v);
    if (v) track("agent_open");
  }, []);
  const toggle = useCallback(() => setOpenState((o) => !o), []);

  const patch = (key: string, fn: (t: UiTurn) => UiTurn) => setTurns((ts) => ts.map((t) => (t.key === key ? fn(t) : t)));

  const ask = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setOpenState(true);
      setDraft("");
      setBusy(true);
      const key = crypto.randomUUID();
      setTurns((ts) => [...ts, { key, user: text, steps: [], cards: [], text: "", status: "streaming" }]);
      track("agent_ask", { len: text.length });

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      let navigateTo: string | undefined;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, path: location.pathname }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const chunk = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const line = chunk.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let ev: AgentEvent;
            try {
              ev = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            switch (ev.type) {
              case "turn":
                patch(key, (t) => ({ ...t, turnId: ev.turnId }));
                break;
              case "step":
                patch(key, (t) => {
                  const existing = t.steps.findIndex((s) => s.id === ev.id);
                  const step: UiStep = { id: ev.id, tool: ev.tool, label: ev.label, status: ev.status, detail: ev.detail, ms: ev.ms };
                  const steps = existing >= 0 ? t.steps.map((s, j) => (j === existing ? step : s)) : [...t.steps, step];
                  return { ...t, steps };
                });
                break;
              case "card":
                patch(key, (t) => ({ ...t, cards: [...t.cards, { kind: ev.kind, id: ev.id, data: ev.data }] }));
                break;
              case "navigate":
                navigateTo = ev.path;
                patch(key, (t) => ({ ...t, navigateTo: ev.path }));
                break;
              case "delta":
                patch(key, (t) => ({ ...t, text: t.text + ev.text }));
                break;
              case "replace":
                patch(key, (t) => ({ ...t, text: ev.text }));
                break;
              case "done":
                patch(key, (t) => ({ ...t, status: "done", meta: { model: ev.model, ms: ev.ms, tokens: ev.tokens } }));
                break;
              case "error":
                patch(key, (t) => ({ ...t, status: "error", error: ev.message }));
                break;
            }
          }
        }
        patch(key, (t) => (t.status === "streaming" ? { ...t, status: "done" } : t));
        if (navigateTo) {
          const to = navigateTo;
          setTimeout(() => {
            router.push(to);
            if (innerWidth < 768) setOpenState(false);
          }, 450);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") patch(key, (t) => ({ ...t, status: "done", text: t.text || "_Stopped._" }));
        else patch(key, (t) => ({ ...t, status: "error", error: "Couldn't reach the agent. Check your connection and try again." }));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, router],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setTurns([]);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
    void fetch("/api/chat", { method: "DELETE" });
    track("agent_reset");
  }, []);

  const rate = useCallback(
    (key: string, v: 1 | -1) => {
      const t = turns.find((x) => x.key === key);
      if (!t?.turnId) return;
      patch(key, (x) => ({ ...x, feedback: v }));
      void fetch("/api/chat/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turnId: t.turnId, value: v }) });
    },
    [turns],
  );

  // ⌘K / Ctrl+K anywhere; "/" when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable=true]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenState((o) => {
          if (!o) track("agent_open", { via: "kbd" });
          return !o;
        });
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setDraft("/");
        setOpenState(true);
      } else if (e.key === "Escape") setOpenState(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle, turns, busy, ask, stop, reset, rate, draft, setDraft }), [open, setOpen, toggle, turns, busy, ask, stop, reset, rate, draft]);
  return <AgentCtx value={value}>{children}</AgentCtx>;
}
