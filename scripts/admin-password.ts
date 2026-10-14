/**
 * Set (or change) the admin password.
 *   npm run admin:password                → prompts (input hidden)
 *   npm run admin:password -- "my secret" → non-interactive
 * Changing the password signs out every existing admin session.
 * Uses TURSO_DATABASE_URL/TURSO_AUTH_TOKEN if set (production), else data/site.db.
 *   e.g.  npx dotenv -e .env.production.local -- npm run admin:password
 */
import bcrypt from "bcryptjs";
import readline from "node:readline";
import "./env";
import { client } from "../src/lib/db-core";

async function prompt(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const out = process.stdout as NodeJS.WriteStream & { _write?: unknown };
  return new Promise((resolve) => {
    // hide what is typed
    const write = out.write.bind(out);
    rl.question(q, (answer) => {
      out.write = write;
      out.write("\n");
      rl.close();
      resolve(answer);
    });
    out.write = ((chunk: string) => (chunk.includes(q) ? write(chunk) : true)) as typeof out.write;
  });
}

async function main() {
  let pw = process.argv[2];
  if (!pw) {
    pw = await prompt("New admin password (12+ characters): ");
    const again = await prompt("Repeat it: ");
    if (pw !== again) throw new Error("The passwords don't match.");
  }
  if (pw.length < 12) throw new Error("Use at least 12 characters.");
  const db = await client();
  const sql = "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value";
  await db.batch(
    [
      { sql, args: ["admin_password_hash", JSON.stringify(await bcrypt.hash(pw, 12))] },
      { sql: "DELETE FROM admin_sessions", args: [] },
    ],
    "write",
  );
  console.log("✓ Admin password saved. Sign in at /admin/login");
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
