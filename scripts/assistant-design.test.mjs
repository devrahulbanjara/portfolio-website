import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("assistant uses the luminous orb design contract", async () => {
  const [mark, consoleSource, chromeSource, css, siteCss] = await Promise.all([
    read("src/components/agent/AgentMark.tsx"),
    read("src/components/agent/StudioConsole.tsx"),
    read("src/components/site/Chrome.tsx"),
    read("src/components/agent/studio.css"),
    read("src/app/ui.css"),
  ]);

  assert.match(mark, /st-assistant-mark/);
  assert.match(mark, /st-sparkle-icon/);
  assert.match(mark, /#d5ad55/);
  assert.match(consoleSource, /st-suggestion-row/);
  assert.match(consoleSource, /st-status-label/);
  assert.match(chromeSource, /AgentMark active=\{busy\} size=\{28\}/);
  assert.match(css, /backdrop-filter:\s*blur/);
  assert.doesNotMatch(css, /conic-gradient\(/);
  assert.doesNotMatch(css, /@keyframes\s+ga-spin/);
  assert.doesNotMatch(siteCss, /\.orb-ask::after[\s\S]*?conic-gradient\(/);
  assert.match(siteCss, /\.orb-ask\s*\{[^}]*background:\s*rgb\(255 255 255 \/ 0\.86\)/);
});
