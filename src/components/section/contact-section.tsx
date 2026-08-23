import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { resolveIcon } from "@/components/icon-registry";
import { profile } from "@/lib/content";

/**
 * Replaces the template's "shoot me a dm on twitter ... I will ignore all
 * soliciting" copy, which also hard-coupled to a `social.X` key by literal
 * lookup. Rahul has no X account, so that key does not exist - links are now
 * iterated, and adding or removing a platform is a data edit.
 */
export default function ContactSection() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70">
      <FlickeringGrid
        className="absolute inset-0 z-0 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        squareSize={3}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.28}
        flickerChance={0.08}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
          Get in touch
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Open to conversations about production AI systems, ML engineering, and
          teaching. The fastest way to reach me is email.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {profile.social.map((link) => {
            const Icon = resolveIcon(link.icon);
            return (
              <a
                key={link.name}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm backdrop-blur transition-colors hover:bg-accent"
              >
                <Icon className="size-4" />
                {link.name}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
