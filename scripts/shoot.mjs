// Visual QA: node scripts/shoot.mjs <outDir> <url> [name] [--mobile] [--scroll=px,px] [--agent] [--light] [--full]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [outDir, url, name = "shot", ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);
const val = (f) => flags.find((x) => x.startsWith(f + "="))?.split("=")[1];
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? "/usr/bin/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const mobile = has("--mobile");
const ctx = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: mobile,
  hasTouch: mobile,
  colorScheme: has("--light") ? "light" : "dark",
});
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message.slice(0, 300)}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2200);

const shots = [];
const snap = async (suffix) => {
  const f = path.join(outDir, `${name}${suffix}${mobile ? "-m" : ""}.png`);
  await page.screenshot({ path: f, fullPage: has("--full") });
  shots.push(f);
};

const scrolls = (val("--scroll") ?? "0").split(",").map(Number);
for (const y of scrolls) {
  await page.evaluate((yy) => {
    const l = window.__lenis;
    if (l) l.scrollTo(yy, { immediate: true, force: true });
    else window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(1600);
  if (val("--hover")) {
    const [hx, hy] = val("--hover").split("x").map(Number);
    await page.mouse.move(hx - 40, hy - 20);
    await page.mouse.move(hx, hy, { steps: 8 });
    await page.waitForTimeout(500);
  }
  await snap(scrolls.length > 1 ? `-${y}` : "");
}

if (has("--agent")) {
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(1200);
  await snap("-agent");
  const q = val("--ask");
  if (q) {
    await page.keyboard.type(decodeURIComponent(q));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(Number(val("--wait") ?? 9000));
    await snap("-agent-answer");
  }
}

console.log(JSON.stringify({ shots, logs: logs.slice(0, 25) }, null, 1));
await browser.close();
