// Sign in, open the admin assistant, optionally ask something: node scripts/admin-assistant-shot.mjs <outDir> <password> [question] [waitMs]
import { chromium } from "@playwright/test";
const [out, pw, q, wait = "15000"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
const logs = [];
p.on("pageerror", (e) => logs.push(e.message.slice(0, 200)));
await p.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await p.fill('input[name="email"]', "rdbanjara07@gmail.com");
await p.fill('input[name="password"]', pw);
await p.click('button[type="submit"]');
await p.waitForSelector(".adm-side", { timeout: 30000 });
await p.waitForLoadState("networkidle");
await p.click(".aa-launch");
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/aa-open.png` });
if (q) {
  await p.fill(".aa-input textarea", q);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1500);
  await p.waitForFunction(() => !document.querySelector(".aa-panel.is-busy"), null, { timeout: Number(wait) });
  await p.waitForTimeout(800);
  console.log((await p.locator(".aa-turn").last().innerText()).slice(0, 900));
  await p.screenshot({ path: `${out}/aa-answer.png` });
}
console.log(JSON.stringify(logs));
await b.close();
