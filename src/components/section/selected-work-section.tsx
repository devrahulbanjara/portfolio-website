import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import SectionHeader from "@/components/section-header";
import { projects } from "@/lib/content";

const DELAY = 0.04;

/**
 * Upstream's projects layout, unchanged: a centred header, then a two-column
 * grid capped at 800px. `auto-rows-fr` is what makes both cards in a row share
 * the taller one's height instead of each shrinking to its own content.
 *
 * Every project gets a card here, flagship or not - upstream has no archive
 * list, and with four projects the grid lands as a clean 2x2. The `flagship`
 * flag still drives the /work case-study pages.
 *
 * Only the subtitle copy differs from upstream: "simple websites to complex web
 * applications" is Dillion's work, not Rahul's.
 */
export default function SelectedWorkSection() {
  return (
    <div className="flex min-h-0 flex-col gap-y-8">
      <SectionHeader pill="My Projects" heading="Check out my latest work">
        Production AI systems, research projects, and tools I&apos;ve built end
        to end — from retrieval and speech to fraud detection. Here are a few of
        my favorites.
      </SectionHeader>

      <div className="mx-auto grid max-w-[800px] auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.map((project, index) => (
          <BlurFade
            key={project.slug}
            delay={DELAY * 12 + index * 0.05}
            className="h-full"
          >
            <ProjectCard project={project} />
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
