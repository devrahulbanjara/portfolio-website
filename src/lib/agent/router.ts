import "server-only";
import { setting, setSettingTyped } from "@/lib/settings";
import { gemini } from "./providers/gemini";
import { groq } from "./providers/groq";
import type { Provider, ProviderId, ProviderLimitError } from "./providers/types";

/**
 * Circuit breaker across LLM providers.
 *
 * Gemini is primary. When it returns 429 we record exactly how long it's out
 * (Google's RetryInfo, or the Pacific-midnight daily reset), and every request
 * until then goes straight to Groq — no wasted round-trip to a provider we know
 * will refuse. When the cooldown passes, Gemini is tried first again.
 *
 * State lives in memory and is mirrored to SQLite so restarts and the admin
 * dashboard both see it.
 */

export type BreakerState = { until: number; status: number; scope: string; since: number; trips: number };
type State = Partial<Record<ProviderId, BreakerState>>;

const ORDER: Provider[] = [gemini, groq];
const TTL_MS = 5_000;
const g = globalThis as unknown as { __llmBreakerV2?: { state: State; at: number } };

/**
 * Breaker state is shared through the database (serverless instances don't
 * share memory) and cached in-process for a few seconds.
 */
async function state(): Promise<State> {
  if (!g.__llmBreakerV2 || Date.now() - g.__llmBreakerV2.at > TTL_MS) g.__llmBreakerV2 = { state: ((await setting("llm_breaker")) as State) ?? {}, at: Date.now() };
  return g.__llmBreakerV2.state;
}

export async function trip(err: ProviderLimitError) {
  const s = await state();
  const prev = s[err.provider];
  s[err.provider] = {
    until: err.until,
    status: err.status,
    scope: err.scope,
    since: prev && prev.until > Date.now() ? prev.since : Date.now(),
    trips: (prev?.trips ?? 0) + 1,
  };
  await setSettingTyped("llm_breaker", s);
}

const openIn = (s: State, id: ProviderId) => !!s[id] && s[id]!.until > Date.now();

/** Providers to try for this request, in order, skipping any whose breaker is open. */
export async function candidates(): Promise<Provider[]> {
  const [forced, s] = await Promise.all([setting("llm_force_provider"), state()]);
  const usable = ORDER.filter((p) => p.configured());
  const ordered = forced === "auto" ? usable : [...usable.filter((p) => p.id === forced), ...usable.filter((p) => p.id !== forced)];
  return ordered.filter((p) => !openIn(s, p.id));
}

/** Soonest time any configured provider becomes available again. */
export async function nextAvailableAt(): Promise<number | null> {
  const s = await state();
  const times = ORDER.filter((p) => p.configured()).map((p) => s[p.id]?.until ?? 0);
  return times.length ? Math.min(...times) : null;
}

export async function providerStatus() {
  const s = await state();
  return ORDER.map((p) => {
    const b = s[p.id];
    return {
      id: p.id,
      model: p.model,
      configured: p.configured(),
      limited: openIn(s, p.id),
      until: b?.until ?? null,
      scope: b?.scope ?? null,
      trips: b?.trips ?? 0,
    };
  });
}

export async function resetBreaker(id?: ProviderId) {
  const s = await state();
  if (id) delete s[id];
  else for (const k of Object.keys(s)) delete s[k as ProviderId];
  await setSettingTyped("llm_breaker", s);
}
