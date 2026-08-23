/* eslint-disable @next/next/no-img-element -- HuggingFaceLogo intentionally
   references an SVG file. next/image does not optimize vector formats, so it
   would add machinery for no benefit. */

type MarkProps = { className?: string };

/**
 * The real, full-colour Hugging Face logo.
 *
 * Referenced as a static asset rather than inlined: it is ~35KB of path data,
 * it must never be recoloured, and as a file the browser caches it once instead
 * of shipping it inside the JS bundle on every page.
 *
 * For monochrome contexts (nav dock, contact row) use HuggingFaceMark instead -
 * a full-colour logo at 16px next to outline icons reads as a mistake.
 */
export function HuggingFaceLogo({ className }: MarkProps) {
  return (
    <img
      src="/logos/hf-logo.svg"
      alt=""
      aria-hidden
      width={16}
      height={16}
      className={className}
    />
  );
}

/** GitHub's Octocat mark. Monochrome, inherits currentColor. */
export function GitHubMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-1.93c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

/**
 * Hugging Face's mark: a face with closed eyes, a smile, and two raised hands.
 *
 * Drawn with currentColor so it can sit as dark ink on the brand yellow pill.
 * The real logo is a yellow face, which would be invisible on a yellow
 * background, so this is the monochrome treatment of the same shape.
 */
export function HuggingFaceMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/*
        Solid face with knocked-out features rather than line art. At the 14px
        the badge renders it at, 1.5px strokes turn to mud; filled shapes hold.

        The logo's two hugging hands are omitted on purpose. Rendered small they
        sit either side of the head and read as parentheses - "(smiley)" - which
        says something the logo doesn't. On the brand yellow, the filled smiley
        alone is already unmistakably Hugging Face.
      */}
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <ellipse cx="8.9" cy="10.2" rx="1.25" ry="1.5" fill="var(--mark-knockout, #FFD21E)" />
      <ellipse cx="15.1" cy="10.2" rx="1.25" ry="1.5" fill="var(--mark-knockout, #FFD21E)" />
      <path
        d="M7.7 14c1 1.7 2.5 2.6 4.3 2.6s3.3-.9 4.3-2.6"
        stroke="var(--mark-knockout, #FFD21E)"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
