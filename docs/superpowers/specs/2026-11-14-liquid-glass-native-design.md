# Light Liquid Glass Native Design

## Goal

Make the private admin panel and both portfolio assistant entry points feel like one polished, light-only native iOS/macOS application: translucent, calm, tactile, and unmistakably part of Rahul's existing warm-white, charcoal, graphite, and gold visual system.

## Design direction

- Light mode is the only mode. Do not add a dark-mode switch or purple/neon AI treatment.
- Use the existing site type, warm-white canvas, charcoal text, graphite dividers, teal utility accent, and gold `AgentMark` as the color vocabulary.
- Add liquid-glass depth with translucent white layers, `backdrop-filter: blur()`/`saturate()`, hairline borders, soft ambient shadows, and restrained specular highlights. Avoid rainbow gradients and heavy chrome.
- Preserve the existing admin information architecture, routes, data flows, keyboard shortcuts, confirmation behavior, and mobile drawer behavior.
- Keep the assistant identity centered on the existing branded SVG sparkle; do not introduce an emoji, orb, black halo, or a second icon language.
- Use motion to communicate hierarchy: panel entrance, staggered suggestions, hover lift, focused controls, and active assistant breathing. All motion must be disabled or reduced under `prefers-reduced-motion: reduce`.

## Surfaces

### Admin shell

- Warm-white page canvas with a very subtle paper/ambient wash.
- Frosted sidebar with a translucent pearl surface, internal hairline, and layered shadow instead of a solid black block.
- Active navigation is a raised glass capsule with a slim gold/teal indicator; badges remain compact and legible.
- Main cards are translucent pearl sheets with soft border and depth, not opaque rectangular blocks.
- Buttons, segmented controls, inputs, pills, tables, editor, login, and mobile drawer inherit the same tokens.
- The admin assistant launcher is a neutral glass capsule with the gold sparkle, not blue/purple gradient chrome.

### Admin assistant

- Light frosted side sheet matching the public assistant panel.
- Assistant head, conversation turns, suggestions, confirm cards, and composer use the same surface and border tokens as the shell.
- Busy state uses a restrained gold/teal breathing highlight; no conic-gradient border.

### Portfolio assistant

- Keep the current warm-white panel and gold sparkle, but unify its panel, chips, composer, cards, focus rings, and scrim with the new glass tokens.
- Keep the assistant's existing content and streaming behavior unchanged.

## Token contract

Define tokens in `src/app/admin/admin.css` and use the same values or compatible aliases in `src/components/agent/studio.css`:

- `--glass-bg: rgb(255 255 255 / 0.64)`
- `--glass-raised: rgb(255 255 255 / 0.78)`
- `--glass-soft: rgb(246 246 243 / 0.68)`
- `--glass-border: rgb(28 29 32 / 0.11)`
- `--glass-highlight: rgb(255 255 255 / 0.84)`
- `--glass-shadow: 0 24px 70px -42px rgb(28 29 32 / 0.42)`
- `--glass-blur: blur(24px) saturate(1.12)`
- `--glass-radius: 20px`
- `--glass-gold: #d5ad55`

## Acceptance criteria

1. Admin pages render with a light glass shell and no dark sidebar or purple/blue AI gradients.
2. The admin assistant and public assistant look like the same branded assistant across the website.
3. The SVG sparkle remains the only assistant mark and is visibly legible at launcher, header, suggestion, and login sizes.
4. Existing links, forms, streaming assistant behavior, confirmation states, keyboard shortcuts, and responsive drawer behavior remain intact.
5. Focus-visible styles remain clearly visible with graphite/gold/teal contrast.
6. Reduced-motion users do not receive panel, shimmer, or active-state animations.
7. Typecheck, lint, design-contract tests, and production build pass.

