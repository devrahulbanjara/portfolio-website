import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "./ContactForm";
import { KathmanduClock } from "@/components/site/Clock";
import { person } from "@/content/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${person.name} about AI engineering roles, projects or training.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <header className="page-intro wrap">
        <h1 className="page-title" data-reveal>
          Let&apos;s start a conversation
        </h1>
      </header>
      <section className="wrap contact-grid" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem) clamp(6rem, 12vw, 10rem)" }}>
        <Suspense>
          <ContactForm />
        </Suspense>
        <aside className="contact-side">
          <div>
            <h3>Availability</h3>
            <p style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="dot-live" /> {person.availability.label}
            </p>
            <p style={{ color: "var(--fg-soft)", fontSize: 15 }}>{person.availability.detail}</p>
          </div>
          <div>
            <h3>Email</h3>
            <a href={`mailto:${person.email}`} data-ev="email_click">
              {person.email}
            </a>
          </div>
          <div>
            <h3>My local time</h3>
            <p>
              <KathmanduClock /> in Kathmandu (UTC+5:45)
            </p>
          </div>
          <div>
            <h3>Looking for something specific?</h3>
            <p>
              <Link href="/services">How I can help</Link>
              <br />
              <Link href="/resume">My résumé</Link>
            </p>
          </div>
          <div>
            <h3>Socials</h3>
            <p>
              {person.socials
                .filter((s) => s.label !== "Email")
                .map((s, i) => (
                  <span key={s.label}>
                    {i > 0 && " · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer me">
                      {s.label}
                    </a>
                  </span>
                ))}
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
