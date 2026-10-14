"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { sendContact, type FormState } from "./actions";
import { track } from "@/components/site/Analytics";

const TOPICS = [
  { v: "hiring", l: "A full-time role" },
  { v: "project", l: "A project" },
  { v: "training", l: "Training for my team" },
  { v: "other", l: "Something else" },
] as const;

export function ContactForm() {
  const params = useSearchParams();
  const initial = TOPICS.find((t) => t.v === params.get("topic"))?.v ?? "hiring";
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, { ok: false });
  const opened = useRef(0);

  useEffect(() => {
    opened.current = Date.now();
    track("contact_open", { topic: initial });
  }, [initial]);

  if (state.ok && state.message)
    return (
      <div className="contact-done" role="status">
        <h2>Thanks — message received.</h2>
        <p>{state.message}</p>
      </div>
    );

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const el = e.currentTarget.elements.namedItem("elapsed") as HTMLInputElement;
        el.value = String(Date.now() - opened.current);
      }}
    >
      <div className="qfield">
        <span className="qnum">01</span>
        <label htmlFor="c-name">What&apos;s your name?</label>
        <input id="c-name" name="name" className="qinput" autoComplete="name" placeholder="Jane Doe *" required maxLength={100} aria-invalid={!!state.errors?.name} />
        {state.errors?.name && <span className="qerr">{state.errors.name}</span>}
      </div>
      <div className="qfield">
        <span className="qnum">02</span>
        <label htmlFor="c-email">What&apos;s your email?</label>
        <input id="c-email" name="email" type="email" className="qinput" autoComplete="email" placeholder="jane@company.com *" required maxLength={200} aria-invalid={!!state.errors?.email} />
        {state.errors?.email && <span className="qerr">{state.errors.email}</span>}
      </div>
      <fieldset className="qfield">
        <span className="qnum">03</span>
        <legend style={{ float: "left" }}>What are you reaching out about?</legend>
        <div className="topic-pills">
          {TOPICS.map((t) => (
            <label key={t.v}>
              <input type="radio" name="topic" value={t.v} defaultChecked={t.v === initial} />
              <span>{t.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="qfield">
        <span className="qnum">04</span>
        <label htmlFor="c-msg">Your message</label>
        <textarea id="c-msg" name="message" className="qinput" required maxLength={5000} placeholder="A few lines about what you're working on *" aria-invalid={!!state.errors?.message} />
        {state.errors?.message && <span className="qerr">{state.errors.message}</span>}
      </div>
      <div className="hp" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="elapsed" defaultValue="" />
      {state.message && !state.ok && <p className="qerr" style={{ marginTop: "1.5rem" }}>{state.message}</p>}
      <div style={{ marginTop: "2.5rem" }}>
        <button type="submit" className="pill-btn pill-btn-dark" disabled={pending} data-ev="contact_submit_click">
          <span>{pending ? "Sending…" : "Send message"}</span>
        </button>
      </div>
    </form>
  );
}
