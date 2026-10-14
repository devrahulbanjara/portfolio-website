/** Read-only peek at the database through the same client the app uses: npm run db:query -- "SELECT ..." */
import "./env";
import { client } from "../src/lib/db-core";

const sql = process.argv[2];
if (!sql || !/^\s*(select|with)\b/i.test(sql)) {
  console.error("Pass a single SELECT query.");
  process.exit(1);
}
client()
  .then((db) => db.execute(sql))
  .then((r) => console.table(r.rows.map((row) => Object.fromEntries(r.columns.map((c, i) => [c, typeof row[i] === "string" ? String(row[i]).slice(0, 80) : row[i]])))))
  .catch((e) => {
    console.error("✗", e.message);
    process.exit(1);
  });
