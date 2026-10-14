import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/site/PageIntro";
import { teaching, person, site } from "@/content/profile";
import { fmtMonth } from "@/lib/format";
import { JsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Teaching — Python, Data Science and ML on AWS",
  description: `${person.name} teaches Python, data science and machine learning on AWS — cohorts, company workshops and AWS certification prep.`,
  alternates: { canonical: "/teaching" },
};

export default function TeachingPage() {
  return (
    <>
      <JsonLd
        data={teaching.courses.map((c) => ({
          "@context": "https://schema.org",
          "@type": "Course",
          name: c.title,
          description: c.description,
          provider: { "@type": "Person", name: person.name, url: site.url },
        }))}
      />
      <PageIntro
        title="I also teach"
        lede="I teach the AWS Machine Learning Engineer certification at TekBay Academy, and I lead the DevCorps AI Learners Community."
        cta={{ href: "/contact", label: "Book a workshop" }}
      />

      <section className="section wrap">
        <div className="stats">
          {teaching.stats.map((s, i) => (
            <div key={s.label} className="stat" data-reveal style={{ ["--d" as string]: i }}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Section label="Courses I teach">
        <ul className="rows-list">
          {teaching.courses.map((c) => (
            <li key={c.id} data-reveal>
              <div className="row-item">
                <span className="row-title">{c.title}</span>
                <span className="row-sub">{c.audience}</span>
                <span className="row-meta">{c.learners ? `${c.learners} learners` : c.format.split(" · ")[0]}</span>
                <div className="row-detail">
                  <p className="row-sub">{c.description}</p>
                  <div className="chip-row">
                    <span className="chip">{c.format}</span>
                    {c.topics.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="How I teach">
        <div className="prose-text">
          {teaching.philosophy.map((p, i) => (
            <p key={i} data-reveal style={{ ["--d" as string]: i }}>
              {p}
            </p>
          ))}
        </div>
      </Section>

      {teaching.talks.length > 0 && (
      <Section label="Talks I've given">
        <ul className="rows-list">
          {teaching.talks.map((t) => (
            <li key={t.title} data-reveal>
              <div className="row-item">
                <span className="row-sub" style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)", color: "var(--fg)", letterSpacing: "-0.02em" }}>
                  {t.title}
                </span>
                <span className="row-sub">{t.event}</span>
                <span className="row-meta">{fmtMonth(t.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      )}
    </>
  );
}
