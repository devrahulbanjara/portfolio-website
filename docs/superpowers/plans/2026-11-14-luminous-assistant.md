# Luminous Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio AI assistant into a fluid luminous glass sheet that matches the site's editorial minimalism.

**Architecture:** Keep the existing assistant state and data flow. Change only the assistant mark's SVG structure, the assistant panel's semantic hooks, and the local studio CSS tokens/layout/motion.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Node's built-in test runner, Playwright browser verification.

**Spec:** `docs/superpowers/specs/2026-11-14-luminous-assistant-design.md`

## Global Constraints

- Preserve the existing `useAgent()` behavior and transcript interactions.
- Do not add dependencies.
- Keep mobile and `prefers-reduced-motion` support.
- Do not copy Apple artwork or exact UI.

## Review Focus

- Busy state: orb and panel should animate softly without flashing or rainbow spinning; verify in browser.
- Reduced motion: animation should be disabled while content stays visible; verify CSS rules and browser behavior.
- Mobile width: panel, input, suggestions, and close control must remain usable below 640px; verify with a narrow viewport.
- Existing assistant content: suggestions, turns, cards, and controls must remain present; verify DOM after render.
- Theme fit: panel should use the portfolio's white/charcoal/indigo system rather than the former neon dark theme; verify screenshot.

### Task 1: Add failing design-contract test

**Files:**
- Create: `scripts/assistant-design.test.mjs`

- [ ] **Step 1: Write the failing test**

  Add Node tests that read `AgentMark.tsx`, `StudioConsole.tsx`, and `studio.css`, asserting the new `st-orb`/`st-assistant-mark` hooks exist, the suggestion row hook exists, and the former `conic-gradient`/`ga-spin` panel treatment is absent.

- [ ] **Step 2: Run test to verify it fails**

  Run `node --test scripts/assistant-design.test.mjs`.
  Expected: FAIL because the current sparkle/neon implementation does not satisfy the new contract.

### Task 2: Implement the luminous assistant mark and panel

**Files:**
- Modify: `src/components/agent/AgentMark.tsx`
- Modify: `src/components/agent/StudioConsole.tsx`
- Modify: `src/components/agent/studio.css`

- [ ] **Step 1: Replace the sparkle cluster**

  Keep `AgentMark({ active, size, mono })` as the public interface, but render a single rounded orb/ring mark with an animated internal gradient when active and a monochrome fallback when requested.

- [ ] **Step 2: Add semantic styling hooks**

  Add classes for the assistant mark wrapper, status label, suggestion row, and input orb while leaving all event handlers and text intact.

- [ ] **Step 3: Replace the panel visual system**

  Use warm light translucent panel tokens, backdrop blur, charcoal text, indigo accents, subtle shadows, soft ambient glow, calmer suggestion rows, and a breathing busy state. Retain the right-side sheet and curved edge behavior.

- [ ] **Step 4: Preserve accessibility and motion fallback**

  Keep existing labels/inert behavior and add reduced-motion rules that remove orb/panel animations without hiding content.

- [ ] **Step 5: Run the contract test**

  Run `node --test scripts/assistant-design.test.mjs`.
  Expected: PASS.

### Task 3: Verify the rendered redesign

**Files:**
- No source changes expected.

- [ ] **Step 1: Run static checks**

  Run `npm run typecheck` and `npm run lint`.

- [ ] **Step 2: Inspect desktop behavior**

  Start `npm run dev`, open the homepage, open the assistant, and verify the panel screenshot, empty state, input focus, and close behavior.

- [ ] **Step 3: Inspect mobile behavior**

  Use a narrow browser viewport and verify the panel fills the screen cleanly, the input remains reachable, and suggestions do not overflow.

- [ ] **Step 4: Inspect busy behavior**

  Trigger a suggestion and verify the orb breathing state and streaming content remain readable.

