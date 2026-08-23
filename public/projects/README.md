# Project card media

Drop project captures here, then point the project's `imageUrl` (or `videoUrl`)
at the file in `src/lib/content/projects.ts`.

Until then every card renders a muted grey block. That is the intended
placeholder — nothing is broken.

## Expected files

One per project, named after its slug:

| File | Project |
| --- | --- |
| `nirantar.png` | Nirantar |
| `convexhire.png` | ConvexHire |
| `insurance-claim-fraud-detection.png` | Insurance Fraud Detection |
| `nepali-asr.png` | Nepali ASR |

## Contract

- **Aspect ratio:** the slot is `h-48` with `object-cover`, so anything wider
  than roughly 2:1 gets cropped top and bottom. Capture at **1200×600** or wider
  at the same ratio and the crop is invisible.
- **Format:** PNG or JPG. Avoid WebP if the same file is ever reused for an OG
  card — Satori cannot decode it.
- **Video:** MP4, muted, and short. It autoplays on loop, so anything with
  motion that never settles is distracting. `videoUrl` wins over `imageUrl`.
- **Dark mode:** the image sits edge to edge with no overlay, so a screenshot
  with a white chrome background will glow against a dark card. Prefer captures
  of the app's own dark theme, or ones with a coloured/gradient frame like the
  upstream template uses.

## Also missing

`dates` is `null` on every project. The date line under each card title is
hidden until those are filled in — they were never recorded on the previous
site, and guessing them is worse than omitting them.
