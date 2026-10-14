// Visual QA with real wheel scrolling: node scripts/wheel.mjs <outDir> <url> [steps=7] [prefix=w] [--mobile] [--hover=x,y]
import { chromium } from "@playwright/test";
const [out, url, steps = "7", prefix = "w", ...flags] = process.argv.slice(2);
const mobile = flags.includes("--mobile");
const b = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1 });
const logs = [];
p.on("pageerror", (e) => logs.push(e.message));
p.on("console", (m) => m.type() === "error" && logs.push(m.text().slice(0, 200)));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
await p.mouse.move(700, 450);
await p.screenshot({ path: `${out}/${prefix}0.png` });
for (let i = 1; i <= Number(steps); i++) {
  for (let k = 0; k < 7; k++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(50); }
  await p.waitForTimeout(1200);
  const hv = flags.find((f) => f.startsWith("--hover="));
  if (hv) { const [x, y] = hv.slice(8).split(",").map(Number); await p.mouse.move(x, y, { steps: 6 }); await p.waitForTimeout(500); }
  await p.screenshot({ path: `${out}/${prefix}${i}.png` });
}
console.log(JSON.stringify(logs.slice(0, 10)));
await b.close();
