"use client";

import Link from "next/link";
import { useState } from "react";
import { projects, experience, certifications, person, services, teaching } from "@/content/profile";
import type { UiCard } from "./AgentProvider";

const fmt = (ym: string | null) => (ym ? new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "Present");

/** Rich cards the assistant can render next to an answer. */
export function AgentCard({ card }: { card: UiCard }) {
  switch (card.kind) {
    case "project": {
      const p = projects.find((x) => x.slug === card.id);
      if (!p) return null;
      return (
        <Link href={`/work/${p.slug}`} className="acard" style={{ ["--c" as string]: p.accent }} data-ev="agent_card" data-ev-kind="project" data-ev-id={p.slug}>
          <span className="acard-top">
            <span className="acard-dot" /> {["Project", p.year].filter(Boolean).join(" · ")}
          </span>
          <span className="acard-title">{p.title}</span>
          <span className="acard-text">{p.tagline}</span>
          <span className="acard-stats">
            {p.results.slice(0, 2).map((r) => (
              <span key={r.metric}>
                <strong>{r.value}</strong>
                {r.metric}
              </span>
            ))}
          </span>
          <span className="acard-cta">See the project →</span>
        </Link>
      );
    }
    case "experience": {
      const e = experience.find((x) => x.id === card.id);
      if (!e) return null;
      return (
        <Link href={`/experience/${e.id}`} className="acard">
          <span className="acard-top">
            {fmt(e.start)} — {fmt(e.end)}
          </span>
          <span className="acard-title">{e.company}</span>
          <span className="acard-text">{e.role}</span>
          <ul className="acard-list">
            {e.highlights.slice(0, 2).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Link>
      );
    }
    case "certifications":
      return (
        <Link href="/about#certifications" className="acard">
          <span className="acard-top">Certifications</span>
          <ul className="acard-rows">
            {certifications.map((c) => (
              <li key={c.id}>
                <strong>{c.code}</strong>
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        </Link>
      );
    case "contact":
      return <ContactCard />;
    case "message":
      return <MessageCard draft={card.data ?? {}} />;
    case "services":
      return (
        <Link href="/services" className="acard">
          <span className="acard-top">You can hire Rahul for</span>
          <ul className="acard-rows">
            {services.map((s) => (
              <li key={s.id}>
                <strong>{s.title}</strong>
                <span>{s.engagement}</span>
              </li>
            ))}
          </ul>
          <span className="acard-cta">How it works →</span>
        </Link>
      );
    case "teaching":
      return (
        <Link href="/teaching" className="acard">
          <span className="acard-top">Teaching</span>
          <ul className="acard-rows">
            {teaching.courses.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong>
                <span>{c.learners} learners</span>
              </li>
            ))}
          </ul>
          <span className="acard-cta">See courses →</span>
        </Link>
      );
    case "post":
      if (!card.id || !card.data) return null;
      return (
        <Link href={`/blog/${card.id}`} className="acard" data-ev="agent_card" data-ev-kind="post" data-ev-id={card.id}>
          <span className="acard-top">Article · {card.data.minutes} min read</span>
          <span className="acard-title">{card.data.title}</span>
          <span className="acard-text">{card.data.excerpt}</span>
          <span className="acard-cta">Read →</span>
        </Link>
      );
  }
}

function ContactCard() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="acard">
      <span className="acard-top">
        <span className="dot-live" /> {person.availability.label}
      </span>
      <span className="acard-text">{person.availability.detail}</span>
      <span className="acard-actions">
        <Link href="/contact" className="acard-btn acard-btn-solid" data-ev="cta_click" data-ev-where="agent_contact_card">
          Get in touch
        </Link>
        <button
          type="button"
          className="acard-btn"
          data-ev="email_copy"
          onClick={() => {
            void navigator.clipboard?.writeText(person.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copied ✓" : "Copy email"}
        </button>
      </span>
    </div>
  );
}

/** The assistant's draft — the visitor checks it, fills in their details and sends it themselves. */
function MessageCard({ draft }: { draft: Record<string, string> }) {
  const [name, setName] = useState(draft.name ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const [message, setMessage] = useState(draft.message ?? "");
  const [state, setState] = useState<"edit" | "sending" | "sent">("edit");
  const [error, setError] = useState<string | null>(null);
  const send = async () => {
    setState("sending");
    setError(null);
    const res = await fetch("/api/chat/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message, topic: draft.topic ?? "other" }) });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> };
    if (body.ok) setState("sent");
    else {
      setState("edit");
      setError(body.error ?? Object.values(body.errors ?? {})[0] ?? "Couldn't send — please try again.");
    }
  };
  if (state === "sent")
    return (
      <div className="acard">
        <span className="acard-top">Message sent</span>
        <span className="acard-text">Thanks{name ? `, ${name.split(" ")[0]}` : ""} — Rahul will get back to you at {email}.</span>
      </div>
    );
  return (
    <form
      className="acard acard-form"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <span className="acard-top">Message to Rahul · check it, then send</span>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={5000} aria-label="Message" required />
      <span className="acard-fields">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" maxLength={100} required autoComplete="name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" type="email" maxLength={200} required autoComplete="email" />
      </span>
      {error && <span className="acard-err">{error}</span>}
      <span className="acard-actions">
        <button type="submit" className="acard-btn acard-btn-solid" disabled={state === "sending"} data-ev="chat_message_send">
          {state === "sending" ? "Sending…" : "Send to Rahul"}
        </button>
      </span>
    </form>
  );
}
