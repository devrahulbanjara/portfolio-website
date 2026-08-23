import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProjectLinkBadge from "@/components/project-link-badge";
import SectionHeader from "@/components/section-header";
import { archiveProjects, flagshipProjects } from "@/lib/content";

/**
 * The largest section on the homepage, per the brief: flagship projects are the
 * main proof of capability.
 *
 * No project has a screenshot yet, so these are deliberately typographic cards
 * that read as intentional rather than as cards with a missing image. When
 * screenshots arrive, `project.imageUrl` becomes non-null and a media slot can
 * be added without restructuring.
 *
 * The header uses the shared centred SectionHeader (upstream's markup) rather
 * than page.tsx's left-aligned `h2`. Only the subtitle copy differs from
 * upstream: "simple websites to complex web applications" is Dillion's work,
 * not Rahul's.
 */
export default function SelectedWorkSection() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader pill="My Projects" heading="Check out my latest work">
        Production AI systems, research projects, and tools I&apos;ve built end
        to end — from retrieval and speech to fraud detection. Here are a few of
        my favorites.
      </SectionHeader>

      <div className="flex flex-col gap-6">
        {flagshipProjects.map((project) => {
          const href = project.hasCaseStudy ? `/work/${project.slug}` : null;

          const card = (
            <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-5 transition-colors group-hover:border-brand/40">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-tight tracking-tight">
                  {project.shortTitle}
                </h3>
                {href ? (
                  <ArrowUpRight
                    className="mt-0.5 size-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                ) : null}
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.summary}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="px-2 py-0 text-[10px]"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              {project.links.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.links.map((link) => (
                    <ProjectLinkBadge key={link.url} link={link} />
                  ))}
                </div>
              ) : null}
            </article>
          );

          return href ? (
            <Link key={project.slug} href={href} className="group">
              {card}
            </Link>
          ) : (
            <div key={project.slug}>{card}</div>
          );
        })}
      </div>

      {archiveProjects.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">
            Also built
          </h3>
          <ul className="flex flex-col gap-2">
            {archiveProjects.map((project) => {
              const primary = project.links[0];
              return (
                <li
                  key={project.slug}
                  className="flex flex-wrap items-baseline gap-x-2 text-sm"
                >
                  <span className="font-medium">{project.shortTitle}</span>
                  <span className="text-muted-foreground">
                    {project.summary}
                  </span>
                  {primary ? <ProjectLinkBadge link={primary} /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
