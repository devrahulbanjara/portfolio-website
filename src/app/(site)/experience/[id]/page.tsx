import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { experience, site, person } from "@/content/profile";
import { Section } from "@/components/site/PageIntro";
import { fmtMonth, duration } from "@/lib/format";
import { JsonLd } from "@/components/site/JsonLd";

export function generateStaticParams() {
  return experience.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/experience/[id]">): Promise<Metadata> {
  const { id } = await params;
  const e = experience.find((x) => x.id === id);
  if (!e) return {};
  return {
    title: `${e.role} at ${e.company}`,
    description: e.summary,
    alternates: { canonical: `/experience/${e.id}` },
    openGraph: { title: `${person.name} — ${e.role} at ${e.company}`, description: e.summary },
  };
}

export default function ExperiencePage({ params }: PageProps<"/experience/[id]">) {
  // Params are read inside Suspense so navigations can show the shell instantly.
  return (
    <Suspense fallback={<div className="page-intro wrap" style={{ minHeight: "60vh" }} />}>
      <ExperienceBody params={params} />
    </Suspense>
  );
}

async function ExperienceBody({ params }: Pick<PageProps<"/experience/[id]">, "params">) {
  const { id } = await params;
  const i = experience.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const e = experience[i];
  const next = experience[(i + 1) % experience.length];

  return (
    <article style={{ ["--c" as string]: "#6f9bff" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OrganizationRole",
          roleName: e.role,
          startDate: e.start,
          ...(e.end ? { endDate: e.end } : {}),
          worksFor: { "@type": "Organization", name: e.company },
          url: `${site.url}/experience/${e.id}`,
        }}
      />
      <header className="page-intro wrap">
        <Link href="/about#experience" className="label" data-reveal>
          ← All experience
        </Link>
        <h1 className="page-title" style={{ marginTop: "1.5rem" }} data-reveal>
          {e.company}
        </h1>
        <p className="page-lede" data-reveal style={{ ["--d" as string]: 1 }}>
          {e.role}. {e.summary}
        </p>
        <dl className="cs-meta" data-reveal style={{ ["--d" as string]: 2 }}>
          <div>
            <dt>When</dt>
            <dd>
              {fmtMonth(e.start)} — {fmtMonth(e.end)}
              <br />
              <span style={{ color: "var(--muted)" }}>{duration(e.start, e.end)}</span>
            </dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{e.type}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{e.location}</dd>
          </div>
          <div>
            <dt>Worked with</dt>
            <dd>{e.stack.join(", ")}</dd>
          </div>
        </dl>
        {e.results.length > 0 && (
          <div className="cs-banner" data-reveal>
            <p className="label" style={{ color: "#3a3b40", marginBottom: "2rem" }}>
              In numbers
            </p>
            <div className="stats">
              {e.results.map((r) => (
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
        )}
      </header>

      <Section label="What I did">
        <ol className="xp-list">
          {e.details.map((d, n) => (
            <li key={d.title} data-reveal>
              <h3>
                <span className="xp-num">{String(n + 1).padStart(2, "0")}</span>
                {d.title}
              </h3>
              <div>
                <p>{d.text}</p>
                {d.links?.length ? (
                  <p className="cs-links" style={{ marginTop: "0.8rem" }}>
                    {d.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" data-ev="xp_link" data-ev-id={e.id}>
                        {l.label} ↗
                      </a>
                    ))}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {next.id !== e.id && (
        <Link href={`/experience/${next.id}`} className="cs-next wrap" data-ev="xp_next">
          <span className="label">Next</span>
          <strong>{next.company}</strong>
          <span className="sub">{next.role}</span>
        </Link>
      )}
    </article>
  );
}
