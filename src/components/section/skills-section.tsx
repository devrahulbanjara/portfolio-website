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
        <div
          key={tech.slug}
          className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2"
        >
          <TechIcon slug={tech.slug} />
          <span className="text-foreground text-sm font-medium">
            {tech.name}
          </span>
        </div>
      ))}
    </div>
  );
}
