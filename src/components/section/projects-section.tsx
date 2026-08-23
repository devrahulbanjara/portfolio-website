import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import SectionHeader from "@/components/section-header";
import { projects } from "@/lib/content";

const DELAY = 0.04;

export default function ProjectsSection() {
  return (
    <div className="flex min-h-0 flex-col gap-y-8">
      <SectionHeader pill="My Projects" heading="Check out my latest work">
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
