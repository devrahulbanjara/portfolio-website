import type { Metadata } from "next";
import { person, experience, education, community, certifications, skills, teaching, projects, site } from "@/content/profile";
import { fmtMonth } from "@/lib/format";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${person.name} — ${person.role} and ${person.secondaryRole} in ${person.location}.`,
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <section className="wrap" style={{ paddingBlock: "clamp(9rem, 14vw, 12rem) clamp(5rem, 10vw, 8rem)" }}>
      <div className="resume">
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
              {person.name}
            </h1>
            <p style={{ marginTop: "0.6rem", fontSize: 18, color: "var(--fg-soft)" }}>
              {person.role} · {person.secondaryRole} · {person.location}
            </p>
            <p style={{ marginTop: "0.4rem", fontSize: 15, color: "var(--muted)" }}>
              {person.email} · {site.url.replace(/^https?:\/\//, "")} ·{" "}
              {person.socials
                .filter((s) => s.url.startsWith("http"))
                .map((s) => s.url.replace(/^https?:\/\/(www\.)?/, ""))
                .join(" · ")}
            </p>
          </div>
          <PrintButton />
        </header>

        <h2>Summary</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
          {person.intro} {person.about[0]}
        </p>

        <h2>Experience</h2>
        {experience.map((e) => (
          <div key={e.id} className="resume-item">
            <h3>
              {e.role} — {e.company}
            </h3>
            <p className="meta">
              {fmtMonth(e.start)} – {fmtMonth(e.end)} · {e.type} · {e.location}
            </p>
            <ul>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Education</h2>
        {education.map((e) => (
          <div key={e.id} className="resume-item">
            <h3>{e.degree}</h3>
            <p className="meta">
              {e.school} · {e.start} – {e.end}
            </p>
          </div>
        ))}
        {community.map((c) => (
          <div key={c.id} className="resume-item">
            <h3>
              {c.role}, {c.name}
            </h3>
            <p className="meta">
              {c.start} – {c.end}
            </p>
          </div>
        ))}

        <h2>Certifications</h2>
        <ul>
          {certifications.map((c) => (
            <li key={c.id}>
              <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer">
                {c.name}
              </a>{" "}
              — {c.issuer}, {c.issued.slice(0, 4)}
            </li>
          ))}
        </ul>

        <h2>Teaching</h2>
        <ul>
          {teaching.courses.map((c) => (
            <li key={c.id}>
              {c.title} — {c.format}
            </li>
          ))}
        </ul>

        <h2>Selected projects</h2>
        <ul>
          {projects.slice(0, 4).map((p) => (
            <li key={p.slug}>
              <strong style={{ fontWeight: 500 }}>{p.title}</strong> — {p.tagline}
            </li>
          ))}
        </ul>

        <h2>Skills</h2>
        <ul>
          {skills.map((g) => (
            <li key={g.group}>
              <strong style={{ fontWeight: 500 }}>{g.group}:</strong> {g.items.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
