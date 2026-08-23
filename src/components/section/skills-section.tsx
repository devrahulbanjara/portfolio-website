import { TechIcon } from "@/components/tech-icon";
import { coreStack } from "@/lib/content";

/**
 * Icon pills for the headline stack.
 *
 * Complements What I Build rather than repeating it: that section says what the
 * capabilities are, this one shows the tools. The capability groups no longer
 * list technology names, so each fact appears once.
 */
export default function SkillsSection() {
  return (
    <div className="flex flex-wrap gap-2">
      {coreStack.map((tech) => (
        <span
          key={tech.slug}
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium ring-2 ring-border/20"
        >
          <TechIcon slug={tech.slug} />
          {tech.name}
        </span>
      ))}
    </div>
  );
}
