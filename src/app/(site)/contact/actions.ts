"use server";

import { nanoid } from "nanoid";
import { ContactInput } from "@/lib/schemas/content";
import { run } from "@/lib/db";
import { requestMeta, ipHash } from "@/lib/request";
import { hit } from "@/lib/agent/guardrails";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string> };

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const parsed = ContactInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    if (errors.website || errors.elapsed) return { ok: true }; // bot — pretend success
    return { ok: false, errors };
  }
  const { ip, country } = await requestMeta();
  const iph = ipHash(ip);
  if (!(await hit(`contact:${iph}`, 5, 3600_000))) return { ok: false, message: "You've sent a few already — I'll reply soon. Or email me directly." };

  const d = parsed.data;
  await run(
    "INSERT INTO contact_messages (id, ts, name, email, topic, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    nanoid(12),
    Date.now(),
    d.name,
    d.email,
    d.topic,
    d.message,
    iph,
  );
  await run("INSERT INTO events (ts, name, path, props) VALUES (?, 'contact_submit', '/contact', ?)", Date.now(), JSON.stringify({ topic: d.topic, country }));
  return { ok: true, message: `Thanks ${d.name.split(" ")[0]} — I usually reply within a day.` };
}
