"use client";

import { useActionState, useTransition } from "react";
import { saveSettings, changePassword, resetModels, type ActionState } from "../../actions";

type Values = {
  chat_enabled: boolean;
  chat_limit_burst: number;
  chat_limit_daily_visitor: number;
  chat_limit_daily_global: number;
  llm_force_provider: "auto" | "gemini" | "groq";
  agent_extra_instructions: string;
  availability_open: boolean;
};

export function SettingsForm({ values }: { values: Values }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettings, { ok: false });
  return (
    <form action={action} className="adm-card" style={{ display: "grid", gap: "1.3rem" }}>
      <h2>Assistant</h2>
      <label className="acheck">
        <input type="checkbox" name="chat_enabled" defaultChecked={values.chat_enabled} />
        Assistant is on
      </label>
      <label className="acheck">
        <input type="checkbox" name="availability_open" defaultChecked={values.availability_open} />
        Show me as available for work
      </label>
      <div className="adm-grid adm-grid-3">
        <div className="afield">
          <label htmlFor="burst">Questions per visitor per 5 minutes</label>
          <input id="burst" className="ainput" type="number" name="chat_limit_burst" min={1} max={200} defaultValue={values.chat_limit_burst} />
        </div>
        <div className="afield">
          <label htmlFor="daily">Questions per visitor per day</label>
          <input id="daily" className="ainput" type="number" name="chat_limit_daily_visitor" min={1} max={5000} defaultValue={values.chat_limit_daily_visitor} />
        </div>
        <div className="afield">
          <label htmlFor="global">Total questions per day (protects your free quota)</label>
          <input id="global" className="ainput" type="number" name="chat_limit_daily_global" min={1} max={100000} defaultValue={values.chat_limit_daily_global} />
        </div>
      </div>
      <div className="afield">
        <label htmlFor="force">Which model answers first</label>
        <select id="force" className="aselect" name="llm_force_provider" defaultValue={values.llm_force_provider}>
          <option value="auto">Automatic — Gemini first, Groq if Gemini is busy</option>
          <option value="gemini">Prefer Gemini</option>
          <option value="groq">Prefer Groq</option>
        </select>
      </div>
      <div className="afield">
        <label htmlFor="extra">Extra notes for the assistant</label>
        <textarea
          id="extra"
          className="atextarea"
          name="agent_extra_instructions"
          rows={5}
          maxLength={4000}
          defaultValue={values.agent_extra_instructions}
          placeholder="e.g. I'm away until 20 November — mention that if someone asks about availability."
        />
        <small>Added to the assistant&apos;s instructions. It still can&apos;t go off-topic or ignore its safety rules.</small>
      </div>
      {state.message && <p className={`toast ${state.ok ? "ok" : "bad"}`}>{state.message}</p>}
      <div>
        <button type="submit" className="abtn abtn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePassword, { ok: false });
  return (
    <form action={action} className="adm-card" style={{ display: "grid", gap: "0.9rem" }}>
      <h2>Password</h2>
      <div className="afield">
        <label htmlFor="pw">New password</label>
        <input id="pw" className="ainput" type="password" name="password" autoComplete="new-password" minLength={12} required />
      </div>
      <div className="afield">
        <label htmlFor="pw2">Repeat it</label>
        <input id="pw2" className="ainput" type="password" name="confirm" autoComplete="new-password" minLength={12} required />
        <small>At least 12 characters. Changing it signs out every other session.</small>
      </div>
      {state.message && <p className="toast bad">{state.message}</p>}
      <div>
        <button type="submit" className="abtn" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </button>
      </div>
    </form>
  );
}

export function ResetModelsButton() {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="abtn" disabled={pending} onClick={() => start(async () => void (await resetModels()))}>
      {pending ? "Resetting…" : "Reset cooldowns"}
    </button>
  );
}
