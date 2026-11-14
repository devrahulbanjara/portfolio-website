import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("assistant uses the luminous sparkle design contract", async () => {
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

test("admin uses the light liquid-glass design contract", async () => {
  const [adminCss, studioCss, adminAssistant] = await Promise.all([
    read("src/app/admin/admin.css"),
    read("src/components/agent/studio.css"),
    read("src/components/admin/AdminAssistant.tsx"),
  ]);

  for (const token of ["--glass-bg", "--glass-raised", "--glass-border", "--glass-shadow", "--glass-blur", "--glass-gold"]) {
    assert.match(adminCss, new RegExp(`${token}:`));
  }
  assert.match(adminCss, /\.adm\s*\{[^}]*background:\s*var\(--glass-soft\)/s);
  assert.match(adminCss, /\.adm-side\s*\{[^}]*backdrop-filter:\s*var\(--glass-blur\)/s);
  assert.match(adminCss, /\.adm-card\s*\{[^}]*background:\s*var\(--glass-bg\)/s);
  assert.match(adminCss, /:focus-visible/);
  assert.match(adminCss, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(adminCss, /--accent:\s*#8b5cf6/);
  assert.doesNotMatch(adminCss, /conic-gradient\(/);
  assert.doesNotMatch(adminCss, /background:\s*var\(--dark\);\s*color:\s*#fff;\s*transform:\s*translateX\(105%\)/);
  assert.match(studioCss, /--glass-bg/);
  assert.match(studioCss, /--glass-blur/);
  assert.match(studioCss, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(studioCss, /linear-gradient\(135deg,\s*#2563eb/);
  assert.match(adminAssistant, /className=\{`aa-panel st-panel/);
  assert.match(adminAssistant, /className="st-suggestion-row"/);
  assert.match(adminAssistant, /className="st-status-label"/);
  assert.match(adminAssistant, /className="st-note"/);
});
