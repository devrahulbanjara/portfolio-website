import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { profile } from "@/lib/content";

/**
 * Structure matches the upstream template exactly: a bordered panel, a "Contact"
 * pill straddling its top edge, a flickering grid confined to the TOP HALF and
 * masked to transparent, then a large centred heading and one balanced
 * paragraph.
 *
 * Differences from upstream, both forced by content rather than taste:
 *   - upstream links to X for DMs; Rahul has no X account, so the call to
 *     action is email
 *   - upstream's copy ends "I will ignore all soliciting", which is Dillion's
 *     voice, not Rahul's
 *
 * The social icons this section used to carry are gone: they already live in the
 * dock, and upstream does not repeat them here.
 */
export default function ContactSection() {
  return (
    <div className="border rounded-xl p-10 relative">
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">Contact</span>
      </div>

      <div className="absolute inset-0 top-0 left-0 right-0 h-1/2 rounded-xl overflow-hidden">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Get in Touch
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground text-balance">
          Want to chat? Send me{" "}
          <a
            href={`mailto:${profile.email}`}
            className="text-blue-500 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            an email
          </a>{" "}
          and I&apos;ll get back to you whenever I can. Always glad to talk
          about production AI systems, ML engineering, or teaching.
        </p>
      </div>
    </div>
  );
}
