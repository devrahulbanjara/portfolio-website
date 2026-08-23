import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import ProjectLinkBadge from "@/components/project-link-badge";
import { caseStudyProjects, profile, projects } from "@/lib/content";

const DELAY = 0.04;

export function generateStaticParams() {
  return caseStudyProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.shortTitle,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.shortTitle,
      description: project.summary,
      type: "article",
      url: `${profile.siteUrl}/work/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.shortTitle,
      description: project.summary,
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug && p.hasCaseStudy);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.summary,
    author: { "@type": "Person", name: profile.name },
    programmingLanguage: project.technologies,
    ...(project.links.find((l) => l.kind === "repository")
      ? { codeRepository: project.links.find((l) => l.kind === "repository")!.url }
      : {}),
  };

  return (
    <main className="relative flex min-h-dvh flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <BlurFade delay={DELAY}>
        <Link
          href="/#work"
          className="group mb-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Selected Work
        </Link>
      </BlurFade>

      <BlurFade delay={DELAY * 2}>
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl">
            {project.shortTitle}
          </h1>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          {project.links.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.links.map((link) => (
                <ProjectLinkBadge key={link.url} link={link} />
              ))}
            </div>
          ) : null}
        </header>
      </BlurFade>

      <BlurFade delay={DELAY * 3}>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">What I built</h2>
          <ul className="flex flex-col gap-3">
            {project.highlights.map((highlight) => (
              <li
                key={highlight}
                className="relative pl-4 leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:rounded-full before:bg-muted-foreground/40"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </section>
      </BlurFade>

      <BlurFade delay={DELAY * 4}>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      </BlurFade>
    </main>
  );
}
