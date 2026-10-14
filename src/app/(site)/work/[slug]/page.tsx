import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, site, person } from "@/content/profile";
import { Section } from "@/components/site/PageIntro";
import { kindOf } from "@/lib/format";
import { JsonLd } from "@/components/site/JsonLd";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.title} — ${p.tagline}`,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { type: "article", title: `${p.title} — case study`, description: p.tagline },
  };
}

export default function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  // Params are read inside Suspense so navigations can show the shell instantly.
  return (
    <Suspense fallback={<div className="page-intro wrap" style={{ minHeight: "60vh" }} />}>
      <CaseStudyBody params={params} />
    </Suspense>
  );
}

async function CaseStudyBody({ params }: Pick<PageProps<"/work/[slug]">, "params">) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <article style={{ ["--c" as string]: p.accent }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          headline: p.tagline,
          description: p.summary,
          url: `${site.url}/work/${p.slug}`,
          author: { "@id": `${site.url}/#person`, name: person.name },
          dateCreated: p.year,
          keywords: p.stack.join(", "),
        }}
      />
      <header className="page-intro wrap">
        <Link href="/work" className="label" data-reveal>
          ← All projects
        </Link>
        <h1 className="page-title" style={{ marginTop: "1.5rem" }} data-reveal>
          {p.title}
        </h1>
        <p className="page-lede" data-reveal style={{ ["--d" as string]: 1 }}>
          {p.tagline}
        </p>
        <dl className="cs-meta" data-reveal style={{ ["--d" as string]: 2 }}>
          <div>
            <dt>Type</dt>
            <dd>{kindOf(p)}</dd>
          </div>
          <div>
            <dt>My role</dt>
            <dd>{p.role}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {p.status} · {p.year}
            </dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>{p.stack.slice(0, 6).join(", ")}</dd>
          </div>
        </dl>
        <div className="cs-banner" data-reveal>
          <p className="label" style={{ color: "#3a3b40", marginBottom: "2rem" }}>
            Results
          </p>
          <div className="stats">
            {p.results.map((r) => (
              <div key={r.metric} className="stat">
                <strong>{r.value}</strong>
                <span>
                  {r.metric}
                  {r.note ? ` (${r.note})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <Section label="Overview">
        <div className="prose-text" data-reveal>
          <p className="big">{p.summary}</p>
        </div>
      </Section>
      <Section label="The problem">
        <div className="prose-text" data-reveal>
          <p>{p.problem}</p>
        </div>
      </Section>
      <Section label="What I built">
        <ol className="cs-steps" data-reveal>
          {p.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </Section>
      <Section label="How it works">
        <ol className="cs-arch" data-reveal>
          {p.architecture.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </Section>
      <Section label="Key decisions">
        <div className="cs-decisions" data-reveal>
          {p.decisions.map((d) => (
            <div key={d.title}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section label="What I learned">
        <div className="prose-text" data-reveal>
          {p.lessons.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </Section>

      <Link href={`/work/${next.slug}`} className="cs-next wrap" data-ev="cs_next">
        <span className="label">Next project</span>
        <strong>{next.title}</strong>
        <span className="sub">{next.tagline}</span>
      </Link>
    </article>
  );
}
