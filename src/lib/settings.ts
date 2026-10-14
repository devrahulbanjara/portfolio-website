import "server-only";
import { z } from "zod";
import { get, run } from "./db";

/**
 * Typed runtime settings (editable from /admin/settings), stored as JSON in
 * the settings table. Every key has a schema and a default, so a bad value in
 * the DB degrades to the default instead of crashing.
 */
export const SettingsSchema = {
  chat_enabled: z.boolean().default(true),
  chat_limit_burst: z.number().int().min(1).max(200).default(12),
  chat_limit_daily_visitor: z.number().int().min(1).max(5000).default(60),
  chat_limit_daily_global: z.number().int().min(1).max(100_000).default(1200),
  llm_force_provider: z.enum(["auto", "gemini", "groq"]).default("auto"),
  agent_extra_instructions: z.string().max(4000).default(""),
  availability_open: z.boolean().default(true),
  admin_password_hash: z.string().nullable().default(null),
  admin_session_epoch: z.string().default("0"),
  llm_breaker: z
    .record(
      z.string(),
      z.object({ until: z.number(), status: z.number(), scope: z.string(), since: z.number(), trips: z.number() }),
    )
    .default({}),
} as const;

export type SettingKey = keyof typeof SettingsSchema;
export type SettingValue<K extends SettingKey> = z.infer<(typeof SettingsSchema)[K]>;

export async function setting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const schema = SettingsSchema[key];
  const row = await get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  let raw: unknown = undefined;
  if (row) {
    try {
      raw = JSON.parse(row.value);
    } catch {}
  }
  const parsed = schema.safeParse(raw);
  return (parsed.success ? parsed.data : schema.parse(undefined)) as SettingValue<K>;
}

export async function setSettingTyped<K extends SettingKey>(key: K, value: SettingValue<K>) {
  const v = SettingsSchema[key].parse(value);
  await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, JSON.stringify(v));
}

/** Editable subset exposed in the admin settings form. */
export const EditableSettings = z.object({
  chat_enabled: SettingsSchema.chat_enabled,
  chat_limit_burst: z.coerce.number().int().min(1).max(200),
  chat_limit_daily_visitor: z.coerce.number().int().min(1).max(5000),
  chat_limit_daily_global: z.coerce.number().int().min(1).max(100_000),
  llm_force_provider: SettingsSchema.llm_force_provider,
  agent_extra_instructions: SettingsSchema.agent_extra_instructions,
  availability_open: SettingsSchema.availability_open,
});
export type EditableSettings = z.infer<typeof EditableSettings>;
