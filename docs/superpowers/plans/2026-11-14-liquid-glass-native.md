# Light Liquid Glass Native UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin panel and portfolio assistant surfaces into a light-only liquid-glass native-app system while preserving existing behavior.

**Architecture:** Keep the current route/component structure and use a shared visual token contract across `admin.css` and `studio.css`. Make the redesign CSS-led, with only minimal component changes where class hooks or accessibility labels are needed; no new UI dependency.

**Tech Stack:** Next.js 16.4, React 19, TypeScript, existing CSS, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-14-liquid-glass-native-design.md`

## Global Constraints

- Light mode is the only mode; do not add a dark-mode switch.
- Do not use purple, blue, rainbow, conic-gradient, or neon assistant chrome.
- Preserve existing routes, data flows, streaming behavior, confirmation behavior, shortcuts, and responsive drawer behavior.
- Preserve the branded SVG `AgentMark` as the only assistant icon.
- Respect `prefers-reduced-motion: reduce`.
- Use existing dependencies only.

## Review Focus

- Collapsed desktop sidebar: labels must disappear while icon rail alignment and tooltips remain usable. Test in the design-contract test.
- Mobile admin drawer: frosted drawer and scrim must retain visibility/transform behavior. Test with CSS contract assertions.
- Busy assistant: must communicate activity without neon border or conic gradient. Test for gold/teal busy hooks and absence of old treatment.
- Keyboard and focus state: controls must retain visible focus without relying on color alone. Test for focus-visible rules.
- Reduced motion: every newly introduced animation must be disabled or reduced. Test for reduced-motion coverage.

---

### Task 1: Add the liquid-glass design contract tests

**Files:**
- Modify: `scripts/assistant-design.test.mjs`
- Create: `docs/superpowers/specs/2026-11-14-liquid-glass-native-design.md`

**Interfaces:**
- Produces executable CSS/content assertions that pin the visual contract before implementation.

- [ ] **Step 1: Write the failing assertions**

  Add assertions that `admin.css` contains the glass tokens, light shell, frosted surfaces, focus-visible treatment, mobile drawer glass, and reduced-motion coverage; assert that old dark assistant panel and purple/conic treatment are absent. Add compatible assertions for `studio.css`.

- [ ] **Step 2: Run the focused test and verify it fails for the missing contract**

  Run: `node --test scripts/assistant-design.test.mjs`

  Expected: FAIL on the new liquid-glass assertions.

- [ ] **Step 3: Keep the test focused on stable design behavior**

  Do not assert implementation formatting or exact selector order; assert tokens and semantic selectors/values only.

### Task 2: Redesign the admin shell and controls

**Files:**
- Modify: `src/app/admin/admin.css`
- Modify: `src/components/admin/AdminShell.tsx` only if a new class hook is required
- Modify: `src/components/admin/AdminNav.tsx` only if active-state semantics need a hook
- Modify: `src/app/admin/login/LoginForm.tsx` only if login needs a visible brand/status wrapper

**Interfaces:**
- Consumes: glass token contract from the spec.
- Produces: light-only `.adm`, `.adm-side`, `.adm-main`, `.adm-card`, controls, login, drawer, and responsive styles without changing public component APIs.

- [ ] **Step 1: Replace the admin palette and shell layers**

  Define the glass tokens and convert the admin canvas, sidebar, top bar, drawer, scrim, cards, tables, and editor to warm translucent surfaces with hairline borders and layered shadows. Keep the sidebar collapse grid math intact.

- [ ] **Step 2: Restyle controls and data surfaces**

  Convert buttons, segmented controls, fields, pills, KPI tiles, charts, tables, message/conversation cards, and login to the same pearl/graphite system. Replace purple/blue accents with `--glass-gold`, existing teal accent, graphite, and semantic green/red states.

- [ ] **Step 3: Preserve interaction affordances**

  Add `:focus-visible` styles, hover lift/press states, touch-safe sizes, and mobile drawer transitions. Use `backdrop-filter` with an opaque fallback so the UI remains readable where blur is unsupported.

- [ ] **Step 4: Run the focused test and typecheck**

  Run: `node --test scripts/assistant-design.test.mjs && npm run typecheck`

  Expected: PASS with no TypeScript errors.

### Task 3: Unify the admin assistant with the portfolio assistant

**Files:**
- Modify: `src/app/admin/admin.css`
- Modify: `src/components/agent/studio.css`
- Modify: `src/components/admin/AdminAssistant.tsx` only if needed for semantic class hooks

**Interfaces:**
- Consumes: the existing `AgentMark`, `AdminEvent`, turn/confirm/link behavior, and glass token contract.
- Produces: a light frosted admin assistant sheet and a visually compatible public assistant sheet with no purple/neon treatment.

- [ ] **Step 1: Restyle admin assistant launcher and panel**

  Make `.aa-launch`, `.aa-panel`, `.aa-head`, `.aa-body`, suggestions, turns, confirmations, and composer use pearl glass, graphite text, gold/teal activity, and matching motion. Remove the conic-gradient border and dark local token override.

- [ ] **Step 2: Refine the public assistant glass system**

  Align `.st-panel`, `.st-scrim`, `.st-head`, `.st-body`, `.st-steps`, `.st-input`, cards, and focus states to the same tokens. Keep the gold sparkle SVG and existing streaming/content behavior intact.

- [ ] **Step 3: Add responsive and reduced-motion guardrails**

  Ensure both sheets remain readable on narrow screens and all new ambient/open/hover motion is removed or reduced for `prefers-reduced-motion`.

- [ ] **Step 4: Run the focused design test**

  Run: `node --test scripts/assistant-design.test.mjs`

  Expected: PASS with no old purple/neon/conic assistant CSS present.

### Task 4: Verify the whole application and review the diff

**Files:**
- Modify: any files required by verification failures only

- [ ] **Step 1: Run the full verification suite**

  Run: `node --test scripts/assistant-design.test.mjs`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

- [ ] **Step 2: Inspect the final diff for scope and behavior preservation**

  Confirm no route/data/API behavior was changed, `.env.local` remains ignored, and no unrelated user work was overwritten.

- [ ] **Step 3: Commit the redesign**

  Use: `git add docs/superpowers src/app/admin/admin.css src/components/agent/studio.css src/components/admin && git commit -m "feat: redesign admin and assistant with liquid glass"`

