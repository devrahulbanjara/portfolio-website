/** Load env vars for CLI scripts: ENV_FILE if given, else .env.local (if present). */
import fs from "node:fs";

const file = process.env.ENV_FILE ?? ".env.local";
if (fs.existsSync(file)) process.loadEnvFile(file);
