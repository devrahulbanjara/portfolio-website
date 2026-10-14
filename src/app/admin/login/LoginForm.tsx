"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type ActionState } from "../actions";
import { AgentMark } from "@/components/agent/AgentMark";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, { ok: false });
  return (
    <form action={action} className="login-card">
      <AgentMark active={pending} size={36} />
      <h1>Welcome back, Rahul</h1>
      <p>Sign in to see messages, conversations, analytics and posts.</p>
      <input type="hidden" name="next" value={next} />
      <input type="email" name="email" placeholder="Email" autoComplete="username" required autoFocus aria-label="Email" />
      <input type="password" name="password" placeholder="Password" autoComplete="current-password" required aria-label="Password" />
      {state.message && <p className="login-err" role="alert">{state.message}</p>}
      <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
