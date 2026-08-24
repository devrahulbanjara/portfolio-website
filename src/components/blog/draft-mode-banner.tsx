/**
 * Only rendered while Draft Mode is on. Its job is to make an easy-to-forget
 * state impossible to miss — otherwise you end up debugging why the live site
 * "still shows the old post" when your own browser is pinned to drafts.
 */
export function DraftModeBanner() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-1.5 text-xs font-medium text-amber-950">
      <span>Draft mode — you are seeing unpublished content</span>
      <a
        href="/api/draft-mode/disable"
        className="rounded border border-amber-950/30 px-2 py-0.5 underline-offset-2 hover:underline"
      >
        Exit
      </a>
    </div>
  );
}
