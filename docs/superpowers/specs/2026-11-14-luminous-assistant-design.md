# Luminous Assistant Design

## Intent

Make the portfolio assistant feel like a calm, fluid system presence inspired by the softness and continuity of Siri, while remaining original and consistent with the portfolio's editorial minimalism.

## Goals

- Replace the current Galaxy-like neon treatment with a restrained luminous glass surface.
- Use one fluid assistant orb/mark instead of a cluster of sparkles.
- Keep the existing chat behavior, streaming states, suggestions, cards, feedback, and controls.
- Preserve reduced-motion support and mobile usability.

## Non-goals

- Do not copy Apple artwork, icons, or exact UI.
- Do not change the agent API, prompt behavior, or transcript persistence.
- Do not add a new animation dependency.

## Visual direction

The panel uses a warm translucent light surface with a dark translucent scrim, thin neutral borders, soft backdrop blur, and a restrained indigo-to-cyan ambient glow. Suggestions become quiet rows with a subtle light sweep on hover. The assistant mark becomes a rounded, breathing orb with a soft internal gradient and a fluid ring while busy. Motion is slow, continuous, and opacity/transform based; all motion collapses under `prefers-reduced-motion`.

## Implementation surface

- `src/components/agent/AgentMark.tsx`: replace the sparkle cluster with a single animated orb mark.
- `src/components/agent/StudioConsole.tsx`: add semantic classes for the assistant orb, status label, and suggestion rows without changing behavior.
- `src/components/agent/studio.css`: replace the dark/neon panel styling with the luminous surface, orb states, calmer rows, and reduced-motion rules.

## Acceptance criteria

- The assistant no longer reads as a dark neon Galaxy-style panel.
- The open panel feels related to the portfolio's white/charcoal/indigo system.
- Busy state is visibly alive but soft: breathing glow and fluid movement, not flashing or rainbow spinning.
- Empty state and conversation state remain readable and functional on desktop and mobile.
