import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/site/PageIntro";
import { services, workProcess, faqs, testimonials, person } from "@/content/profile";
import { JsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Hire me — AI agents, RAG, audits and training",
  description: `Hire ${person.name} to build an AI agent or RAG system, review an LLM feature, or train your team in Python, data science and ML on AWS.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <PageIntro title="How I can help your team" lede={`${person.availability.label}. ${person.availability.detail}.`} cta={{ href: "/contact", label: "Get in touch" }} />

      <Section label="What I offer">
        <ul className="rows-list">
          {services.map((s) => (
            <li key={s.id} data-reveal>
              <div className="row-item">
                <span className="row-title">{s.title}</span>
                <span className="row-sub">{s.pitch}</span>
                <span className="row-meta">{s.engagement}</span>
                <div className="row-detail">
                  <ul>
                    {s.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <p className="row-sub">{s.outcome}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="How we'd work together">
        <ul className="rows-list">
          {workProcess.map((s) => (
            <li key={s.step} data-reveal>
              <div className="row-item">
                <span className="row-sub" style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)", color: "var(--fg)", letterSpacing: "-0.03em" }}>
                  {s.step}. {s.title}
                </span>
                <span className="row-sub">{s.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {testimonials.length > 0 && (
      <Section label="What people say">
        <div className="prose-text" style={{ display: "grid", gap: "2.6rem" }}>
          {testimonials.map((t) => (
            <figure key={t.name} data-reveal>
              <blockquote className="big">“{t.quote}”</blockquote>
              <figcaption style={{ marginTop: "0.8rem", color: "var(--muted)", fontSize: 15 }}>
                {t.name}, {t.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      )}

      <Section label="Questions people ask">
        <ul className="rows-list">
          {faqs.map((f) => (
            <li key={f.q} data-reveal>
              <div className="row-item" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                <span className="row-sub" style={{ fontSize: 19, color: "var(--fg)" }}>
                  {f.q}
                </span>
                <span className="row-sub">{f.a}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
