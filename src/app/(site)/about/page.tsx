import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/site/PageIntro";
import { person, experience, certifications, skills, education, community } from "@/content/profile";
import { fmtMonth, duration } from "@/lib/format";

export const metadata: Metadata = {
  title: "About — AI engineer and educator in Kathmandu",
  description: `${person.name} is an AI engineer in Kathmandu who builds LLM agents, search systems and ML on AWS, and teaches Python, data science and ML.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageIntro title="A bit about me" cta={{ href: "/resume", label: "My résumé" }} />

      <section className="section wrap">
        <div className="about-grid">
          <figure className="about-photo" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element -- local photo */}
            <img src="/portrait-photo.png" alt={person.name} width={747} height={905} />
          </figure>
          <div className="prose-text">
            <p className="big" data-reveal>
              {person.intro}
            </p>
            {person.about.map((p, i) => (
              <p key={i} data-reveal style={{ ["--d" as string]: i + 1 }}>
                {p}
              </p>
            ))}
            <p data-reveal>I speak {person.languages.join(", ")}.</p>
          </div>
        </div>
      </section>

      <Section label="Where I've worked" id="experience">
        <ul className="rows-list">
          {experience.map((e) => (
            <li key={e.id} data-reveal>
              <div className="row-item">
                <span className="row-title">{e.company}</span>
                <span className="row-sub">{e.role}</span>
                <span className="row-meta">
                  {fmtMonth(e.start)} — {fmtMonth(e.end)} · {duration(e.start, e.end)}
                </span>
                <div className="row-detail">
                  <ul>
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <div className="chip-row">
                    {e.stack.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Education & community" id="education">
        <ul className="rows-list">
          {education.map((e) => (
            <li key={e.id} data-reveal>
              <div className="row-item">
                <span className="row-title">{e.school}</span>
                <span className="row-sub">{e.degree}</span>
                <span className="row-meta">
                  {e.start} — {e.end}
                </span>
              </div>
            </li>
          ))}
          {community.map((c) => (
            <li key={c.id} data-reveal>
              <div className="row-item">
                <span className="row-title">{c.name}</span>
                <span className="row-sub">{c.role}</span>
                <span className="row-meta">
                  {c.start} — {c.end}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="My certifications" id="certifications">
        <ul className="rows-list">
          {certifications.map((c) => (
            <li key={c.id} data-reveal>
              <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="row-item" data-ev="cert_click" data-ev-cert={c.id}>
                <span className="row-title">{c.name}</span>
                <span className="row-sub">
                  {c.issuer} · {c.code}
                </span>
                <span className="row-meta">Earned {fmtMonth(c.issued)} ↗</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="label" style={{ marginTop: "1.2rem", textTransform: "none", letterSpacing: 0, fontSize: 14 }}>
          Each one links to the issuer&apos;s page where you can verify it.
        </p>
      </Section>

      <Section label="What I work with" id="skills">
        <div className="skills" style={{ display: "grid", gap: "2rem" }}>
          {skills.map((g) => (
            <div key={g.group} data-reveal>
              <p style={{ fontSize: 18, marginBottom: "0.8rem" }}>{g.group}</p>
              <div className="chip-row">
                {g.items.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
