/**
 * Create / upgrade the database schema. Runs against Turso when
 * TURSO_DATABASE_URL is set, otherwise data/site.db.
 *   npm run db:setup
 */
import "./env";
import { client } from "../src/lib/db-core";

client()
  .then(async (db) => {
    const t = await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    console.log(`✓ Database ready (${process.env.TURSO_DATABASE_URL ? "Turso" : "local file"}) — tables: ${t.rows.map((r) => r[0]).join(", ")}`);
  })
  .catch((e) => {
    console.error("✗", e.message);
    process.exit(1);
  });
