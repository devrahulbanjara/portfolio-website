// Sign in to /admin with Playwright and screenshot each section: node scripts/admin-shots.mjs <outDir> <password> [paths...]
import { chromium } from "@playwright/test";
const [out, pw, ...paths] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const logs = [];
p.on("pageerror", (e) => logs.push(`[pageerror] ${e.message.slice(0, 200)}`));
p.on("console", (m) => m.type() === "error" && logs.push(`[console] ${m.text().slice(0, 200)}`));
await p.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await p.fill('input[name="email"]', "rdbanjara07@gmail.com");
await p.fill('input[name="password"]', pw);
await p.click('button[type="submit"]');
await p.waitForSelector(".adm-side", { timeout: 30000 });
for (const path of paths.length ? paths : ["/admin"]) {
  const r = await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const name = path.replace(/\W+/g, "_") || "root";
  await p.screenshot({ path: `${out}/adm${name}.png`, fullPage: true });
  console.log(r.status(), path);
}
console.log(JSON.stringify(logs.slice(0, 10)));
await b.close();
