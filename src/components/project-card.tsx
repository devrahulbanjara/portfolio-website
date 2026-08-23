/* eslint-disable @next/next/no-img-element -- the media slot needs an onError
   handler to fall back to the placeholder block, and next/image swallows it. */
"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ProjectLinkBadge from "@/components/project-link-badge";
import type { Project } from "@/lib/content/types";

/**
 * The upstream template's project card, structurally unchanged: fixed-height
 * media strip on top with link badges floated over its top-right corner, then
 * title + date, description, and tags pinned to the bottom by `mt-auto` so
 * cards of differing text length still line their tag rows up.
 *
 * Two adaptations:
 *   - no react-markdown: `summary` is plain text, so a Markdown pass would only
 *     add a client-side parser for nothing
 *   - the whole-card link points at the internal /work/[slug] case study when
 *     one exists, so it must NOT open in a new tab; only external hrefs do
 */

/**
 * Missing media is the expected state right now, not an error - no project has
 * a capture yet. `onError` covers the other case: a path is set but the file
 * isn't there, which would otherwise show a broken-image glyph.
 */
function ProjectMedia({
  imageUrl,
  videoUrl,
  alt,
}: {
  imageUrl: string | null;
  videoUrl: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="h-48 w-full object-cover"
      />
    );
  }

  if (!imageUrl || failed) {
    return <div className="h-48 w-full bg-muted" />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="h-48 w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function ProjectCard({ project }: { project: Project }) {
  // Prefer the case study, then the project's own primary link. A card with
  // neither still renders; its arrow just isn't a link.
  const caseStudyHref = project.hasCaseStudy ? `/work/${project.slug}` : null;
  const href = caseStudyHref ?? project.links[0]?.url ?? null;
  const isExternal = href !== null && caseStudyHref === null;

  const externalProps = isExternal
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <div className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border transition-all duration-200 hover:ring-2 hover:ring-muted">
      <div className="relative shrink-0">
        {href ? (
          <Link href={href} {...externalProps} className="block">
            <ProjectMedia
              imageUrl={project.imageUrl}
              videoUrl={project.videoUrl}
              alt={project.shortTitle}
            />
          </Link>
        ) : (
          <ProjectMedia
            imageUrl={project.imageUrl}
            videoUrl={project.videoUrl}
            alt={project.shortTitle}
          />
        )}

        {project.links.length > 0 ? (
          <div className="absolute right-2 top-2 flex flex-wrap gap-2">
            {project.links.map((link) => (
              <ProjectLinkBadge key={link.url} link={link} variant="overlay" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{project.shortTitle}</h3>
            {project.dates ? (
              <time className="text-xs text-muted-foreground">
                {project.dates}
              </time>
            ) : null}
          </div>
          {href ? (
            <Link
              href={href}
              {...externalProps}
              aria-label={`Open ${project.shortTitle}`}
              className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>

        <p className="flex-1 text-pretty font-sans text-xs leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        {project.technologies.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1">
            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="h-6 w-fit border border-border px-2 text-[11px] font-medium"
              >
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
