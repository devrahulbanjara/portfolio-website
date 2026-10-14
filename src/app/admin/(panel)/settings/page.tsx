import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { setting } from "@/lib/settings";
import { providerStatus } from "@/lib/agent/router";
import { memoryStats } from "@/lib/agent/memory";
import { PageHead, Loading, when } from "@/components/admin/ui";
import { SettingsForm, PasswordForm, ResetModelsButton } from "./forms";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  await connection();
  const values = {
    chat_enabled: await setting("chat_enabled"),
    chat_limit_burst: await setting("chat_limit_burst"),
    chat_limit_daily_visitor: await setting("chat_limit_daily_visitor"),
    chat_limit_daily_global: await setting("chat_limit_daily_global"),
    llm_force_provider: await setting("llm_force_provider"),
    agent_extra_instructions: await setting("agent_extra_instructions"),
    availability_open: await setting("availability_open"),
  };
  const models = await providerStatus();
  const mem = memoryStats();

  return (
    <>
      <PageHead title="Settings" sub="How your assistant behaves, and your account." />
      <div className="adm-grid" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", alignItems: "start" }}>
        <SettingsForm values={values} />
        <div className="adm-grid">
          <section className="adm-card">
            <h2>Models</h2>
            <ul className="barlist">
              {models.map((m) => (
                <li key={m.id}>
                  <span>
                    {m.id === "gemini" ? "Gemini (primary)" : "Groq (backup)"} · {m.model}
                  </span>
                  <span className={`pill ${!m.configured ? "" : m.limited ? "warn" : "ok"}`}>{!m.configured ? "no API key" : m.limited ? `cooling down until ${when(m.until!)}` : "ready"}</span>
                </li>
              ))}
            </ul>
            <p className="empty" style={{ marginTop: "0.6rem" }}>
              When a model hits its free-tier limit it rests until the limit resets, and the other model answers in the meantime.
            </p>
            <div style={{ marginTop: "0.8rem" }}>
              <ResetModelsButton />
            </div>
          </section>
          <section className="adm-card">
            <h2>Conversation memory</h2>
            <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.55 }}>
              {mem.sessions} active chats in memory. Each remembers its last {mem.maxExchanges} questions for {mem.idleMinutes} minutes, and never sees anyone else&apos;s.
            </p>
          </section>
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
