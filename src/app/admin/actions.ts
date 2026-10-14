"use server";

import { redirect } from "next/navigation";
import { updateTag, refresh } from "next/cache";
import { z } from "zod";
import { login, logout, requireAdmin, setAdminPassword, revokeSessions } from "@/lib/auth";
import { run } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requestMeta } from "@/lib/request";
import { EditableSettings, setSettingTyped } from "@/lib/settings";
import { resetBreaker } from "@/lib/agent/router";
import { upsertPost, removePost } from "@/lib/services/posts";

export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string>; id?: string };

const meta = async () => {
  const { ip, ua } = await requestMeta();
  return { ip, ua };
};

/* ── session ─────────────────────────────────────────────── */
export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  const res = await login(email, password);
  if (!res.ok) return { ok: false, message: res.error };
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await requireAdmin();
  await logout();
  redirect("/admin/login");
}

/* ── messages ────────────────────────────────────────────── */
const Id = z.string().min(1).max(40);

export async function setMessageState(id: string, patch: { read?: boolean; archived?: boolean }) {
  await requireAdmin();
  const mid = Id.parse(id);
  if (patch.read !== undefined) await run("UPDATE contact_messages SET read = ? WHERE id = ?", patch.read ? 1 : 0, mid);
  if (patch.archived !== undefined) await run("UPDATE contact_messages SET archived = ? WHERE id = ?", patch.archived ? 1 : 0, mid);
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await run("DELETE FROM contact_messages WHERE id = ?", Id.parse(id));
  await audit("message.delete", id, await meta());
}

export async function clearErrors() {
  await requireAdmin();
  await run("DELETE FROM error_log");
  await audit("logs.clear", null, await meta());
}

/* ── posts ───────────────────────────────────────────────── */
export async function savePost(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  const res = await upsertPost(
    {
      ...raw,
      tags: String(raw.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: raw.featured === "on",
      publishedAt: raw.publishedAt ? new Date(String(raw.publishedAt)).getTime() : null,
    },
    updateTag,
  );
  if (!res.ok) return { ok: false, message: res.message, errors: res.errors };
  await audit(res.created ? "post.create" : "post.update", res.id, { ...(await meta()), slug: res.slug, status: res.status });
  return { ok: true, message: res.status === "published" ? "Published." : res.status === "scheduled" ? "Scheduled." : "Draft saved.", id: res.id };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const slug = await removePost(Id.parse(id), updateTag);
  await audit("post.delete", id, { ...(await meta()), slug });
  redirect("/admin/posts");
}

/* ── settings ────────────────────────────────────────────── */
export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = EditableSettings.safeParse({
    ...Object.fromEntries(form),
    chat_enabled: form.get("chat_enabled") === "on",
    availability_open: form.get("availability_open") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
  for (const [k, v] of Object.entries(parsed.data)) await setSettingTyped(k as keyof typeof parsed.data, v as never);
  await audit("settings.update", null, { ...(await meta()), keys: Object.keys(parsed.data) });
  return { ok: true, message: "Settings saved." };
}

export async function resetModels() {
  await requireAdmin();
  await resetBreaker();
  await audit("llm.breaker.reset", null, await meta());
}

export async function revokeSession(id: string) {
  const me = await requireAdmin();
  if (!/^[a-f0-9]{64}$/.test(id) || id === me.id) return;
  await revokeSessions({ id });
  refresh();
}

export async function revokeOtherSessions() {
  const me = await requireAdmin();
  await revokeSessions({ allExcept: me.id });
  refresh();
}

export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const pw = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (pw.length < 12) return { ok: false, message: "Use at least 12 characters." };
  if (pw !== confirm) return { ok: false, message: "The two passwords don't match." };
  await setAdminPassword(pw);
  await audit("password.change", null, await meta());
  redirect("/admin/login");
}
