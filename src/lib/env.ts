import "server-only";
import { z } from "zod";

/**
 * Typed, validated environment — the TypeScript equivalent of pydantic-settings.
 * Parsed once at import; a bad value fails loudly at boot instead of at 2am.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  DATA_DIR: z.string().optional(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars").optional(),
  ADMIN_PASSWORD_HASH: z.string().startsWith("$2").optional(),

  GEMINI_API_KEY: z.string().min(10).optional(),
  GEMINI_MODELS: z.string().default("gemini-2.5-flash,gemini-3.1-flash-lite"),
  ADMIN_GEMINI_API_KEY: z.string().min(10).optional(),
  ADMIN_GEMINI_MODELS: z.string().default("gemini-2.5-flash,gemini-3.8-flash,gemini-3.1-flash-lite"),
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GROQ_API_KEY: z.string().min(10).optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),

  UPLOAD_MAX_MB: z.coerce.number().int().positive().max(50).default(8),
});

export type Env = z.infer<typeof EnvSchema>;

function load(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === "production" && !env.AUTH_SECRET) throw new Error("AUTH_SECRET is required in production");
  return env;
}

export const env = load();
