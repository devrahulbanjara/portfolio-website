# Logos

All seven supplied and verified 2026-08-23 by rendering on light and dark backgrounds.
**Complete — nothing further needed from Rahul.**

## The set

| File | Used for | Size | Notes |
|---|---|---|---|
| `adex-international.png` | Adex International (work) | 567×143 | White bg removed |
| `tekbay-academy.png` | TekBay Academy (work) | 512×512 | Square emblem |
| `fusemachines.png` | Fusemachines (work + cert) | 1024×164 | Wide wordmark, 6.2:1 |
| `herald-college.png` | Herald College (education) | 200×200 | Opaque green tile by design |
| `aws.svg` | AWS cert issuer | vector | Scales cleanly, prefer it |
| `nvidia.png` | NVIDIA cert issuer | 1200×936 | Already transparent |
| `devcorps-ailearners.png` | DevCorps AI Learners (activities) | 378×267 | White bg, tight crop |
| `hf-logo.svg` | Hugging Face link badge | vector | Full colour, see note below |

Reuse `fusemachines.png` for both the work entry and the Microdegree certification —
do not duplicate the file.

## Two things the component MUST do

### 1. Neutral chip behind every logo — required, not cosmetic

Verified by rendering: on the dark theme background, **AWS and NVIDIA are both black
wordmarks and become nearly invisible** — only the orange smile and the green eye
remain readable. Adex purple (`#4D2D7C`) goes dim.

In **dark mode**, render each logo on a light surface. In **light mode** use only a
thin ring on the page background - a grey fill there reads as a heavy box and makes
the page look less finished than it should (compared side by side with the upstream
template, this was the single biggest visual regression).

```
dark mode, no chip          dark mode, with chip
┌──────────────────┐        ┌──────────────────┐
│ ▓▓▓▓  (invisible)│        │ ┌────────────┐   │
│                  │   →    │ │   aws      │   │
│  ~~~ orange only │        │ └────────────┘   │
└──────────────────┘        └──────────────────┘
```

### 2. Fixed-height, auto-width slot — not a square avatar

Aspect ratios span 1:1 (`tekbay`, `herald`) to 6.2:1 (`fusemachines`). Use a
fixed-height container with `object-contain` and auto width. The template's
`work-section.tsx` uses a square Avatar — that must change, or wordmarks squash.

At equal height, square emblems read visually smaller than wordmarks. Consider
normalizing by area rather than height alone.

## Conventions

- Extensions must match actual file format. Three uploads arrived mislabeled (an SVG
  and a WebP both named `.png`); files in `public/` get their `Content-Type` from the
  extension, so a mislabeled SVG will not render. Verify with `file <name>` after adding.
- Transparent background, except where an opaque tile is the brand (Herald).
- Lowercase, hyphenated names.
- `adex-international.original.png` is the pre-processing backup. Safe to delete once
  the site ships.

## Missing-file behavior

`work-section.tsx` has an `onError` fallback that degrades to initials, so a missing or
broken logo never breaks the page.

## `hf-logo.svg` — the one full-colour logo

Unlike the organization logos above, this is used at small size inside a link
badge, not on a neutral chip.

- **Full colour** (#FFD21E yellow, #FF9D00/#FFAD03 orange, #FF323D, #32343D).
  It must never be recoloured or forced to `currentColor`.
- **The badge is HF's dark navy `#32343D`, not their yellow.** The logo is
  already yellow, so a yellow pill would put yellow on yellow.
- Referenced as a file (`<img src>`) rather than inlined, because it is ~35KB of
  path data that would otherwise ship in the JS bundle on every page. `next/image`
  is not used: it does not optimize vector formats.
- Rendered by `HuggingFaceLogo` in `src/components/brand-marks.tsx`.

For **monochrome** contexts — the nav dock and the contact row, where it sits
beside outline icons — use `HuggingFaceMark` from the same file instead. A
full-colour logo at 16px next to line icons reads as a mistake.
