/** Provider-neutral conversation model used by the agent loop. */

export type ToolCall = { id: string; name: string; args: Record<string, unknown> };

export type NeutralMessage =
  | { role: "user"; text: string }
  /** `raw` keeps the provider's native payload (e.g. Gemini thought signatures) for same-provider replays. */
  | { role: "assistant"; text: string; toolCalls: ToolCall[]; raw?: { provider: ProviderId; model?: string; data: unknown } }
  | { role: "tool"; results: { id: string; name: string; result: unknown }[] };

export type ToolSpec = { name: string; description: string; parameters: Record<string, unknown> };

export type ProviderId = "gemini" | "groq";

export type StepResult = {
  text: string;
  toolCalls: ToolCall[];
  raw?: unknown;
  usage: { input: number; output: number; thoughts: number };
  model: string;
};

export type StepInput = {
  system: string;
  messages: NeutralMessage[];
  tools: ToolSpec[];
  signal: AbortSignal;
  /** Called with each visible text delta as it streams. Return false to stop the stream. */
  onText: (delta: string) => boolean;
  /** Called for any streamed chunk (text or tool call) — used for first-byte timeouts. */
  onChunk?: () => void;
};

/** Thrown by adapters when the provider is rate limited / overloaded. */
export class ProviderLimitError extends Error {
  constructor(
    public provider: ProviderId,
    public status: number,
    /** Epoch ms until which this provider should be skipped. */
    public until: number,
    public scope: "minute" | "day" | "overload" | "unknown",
  ) {
    super(`${provider} limited (${status}, ${scope}) until ${new Date(until).toISOString()}`);
  }
}

export interface Provider {
  id: ProviderId;
  model: string;
  configured(): boolean;
  step(input: StepInput): Promise<StepResult>;
}
