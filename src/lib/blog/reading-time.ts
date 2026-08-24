/** Average adult reading speed for technical prose. */
const WORDS_PER_MINUTE = 200;

/**
 * Reading time in whole minutes, never zero.
 *
 * Rounds up because "0 min read" is nonsense and "1 min read" is honest for
 * anything short.
 */
export function readingTimeFromWordCount(wordCount: number | null): number {
  if (!wordCount || wordCount < 0) return 1;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
