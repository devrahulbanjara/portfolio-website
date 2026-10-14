// End-to-end: assistant creates a draft, proposes deleting it, we confirm. node scripts/admin-write-test.mjs <outDir> <password>
import { chromium } from "@playwright/test";
const [out, pw] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await p.fill('input[name="email"]', "rdbanjara07@gmail.com");
await p.fill('input[name="password"]', pw);
await p.click('button[type="submit"]');
await p.waitForSelector(".adm-side", { timeout: 30000 });
await p.click(".aa-launch");
await p.waitForTimeout(700);
const ask = async (q, wait) => {
  await p.fill(".aa-input textarea", q);
  await p.keyboard.press("Enter");
  await p.waitForFunction(() => !document.querySelector(".aa-panel.is-busy"), null, { timeout: wait });
  await p.waitForTimeout(500);
};
await ask("Create a short draft post titled 'Assistant test post' with two sentences about testing. Then tell me its id.", 90000);
await p.screenshot({ path: `${out}/aw-1.png` });
await ask("Now delete that draft post.", 90000);
await p.screenshot({ path: `${out}/aw-2.png` });
const btn = p.locator(".aa-confirm .aa-go").last();
console.log("confirm cards:", await p.locator(".aa-confirm").count());
if (await btn.count()) {
  await btn.click();
  await p.waitForTimeout(2000);
  console.log("state:", await p.locator(".aa-confirm .aa-state").last().textContent());
}
await p.screenshot({ path: `${out}/aw-3.png` });
await b.close();
