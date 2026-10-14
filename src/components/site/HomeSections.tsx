"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { person, projects, teaching, certifications, services } from "@/content/profile";
import { useAgent } from "@/components/agent/AgentProvider";
import { AgentMark } from "@/components/agent/AgentMark";
import { Magnetic } from "./Magnetic";
import { ProjectList } from "./ProjectList";

/* ───────────────────────── hero ───────────────────────── */
export function Hero() {
  const track = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);

  // The name drifts continuously; scrolling flips its direction and gives it a push.
  useEffect(() => {
    let x = 0,
      dir = -1,
      boost = 0,
      lastY = scrollY,
      raf = 0;
    const loop = () => {
      const y = scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) {
        dir = dy > 0 ? -1 : 1;
        boost = Math.min(6, boost + Math.abs(dy) * 0.04);
      }
      boost *= 0.92;
      x += dir * (0.045 + boost * 0.03);
      if (x <= -50) x += 50;
      if (x > 0) x -= 50;
      if (track.current) track.current.style.transform = `translate3d(${x}%,0,0)`;
      if (photo.current && y < innerHeight * 1.2) photo.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="hero" aria-label="Introduction">
      <div ref={photo} className="hero-photo">
        {/* eslint-disable-next-line @next/next/no-img-element -- local cut-out portrait */}
        <img src="/portrait.png" alt={`Portrait of ${person.name}`} width={747} height={873} fetchPriority="high" />
      </div>

      <div className="loc-pill">
        <span>
          Based in
          <br />
          Kathmandu,
          <br />
          Nepal
        </span>
        <span className="globe" aria-hidden>
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="20" cy="20" r="15" />
            <ellipse className="globe-spin" cx="20" cy="20" rx="7" ry="15" />
            <path d="M5 20h30M8 12h24M8 28h24" />
          </svg>
        </span>
      </div>

      <div className="role">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M3 3l12 12M15 5v10H5" />
        </svg>
        <p>
          AI Engineer
          <br />& Educator
        </p>
      </div>

      <h1 className="marquee" aria-label={`${person.name}, AI Engineer and Educator`}>
        <div ref={track} className="marquee-track" aria-hidden>
          {[0, 1].map((k) => (
            <span key={k}>Rahul Dev Banjara —&nbsp;</span>
          ))}
        </div>
      </h1>
    </section>
  );
}

/* ───────────────────────── intro + ask the assistant ───────────────────────── */
export function Intro() {
  const { ask } = useAgent();
  const [q, setQ] = useState("");
  const chips = ["What has he built?", "Is he available for work?", "What does he teach?"];
  return (
    <section className="intro wrap">
      <div className="intro-grid">
        <p className="statement" data-reveal>
          I build AI systems end to end — from the data and the model to the product people use every day. I also teach the AWS Machine Learning Engineer certification.
        </p>
        <div className="intro-side" data-reveal style={{ ["--d" as string]: 2 }}>
          <p>I&apos;m an AI/ML engineer at Adex International and an AWS ML trainer at TekBay Academy. Before that, I was an AI Fellow at Fusemachines.</p>
          <Magnetic>
            <Link href="/about" className="circle-btn circle-btn-dark">
              <span>About me</span>
            </Link>
          </Magnetic>
        </div>
      </div>

      <div className="ask" data-reveal>
        <p className="label">Ask my AI assistant anything about me</p>
        <form
          className="ask-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) ask(q);
            setQ("");
          }}
        >
          <AgentMark active={false} size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What projects has Rahul shipped?" aria-label="Ask about Rahul" maxLength={600} />
          <button type="submit" disabled={!q.trim()} aria-label="Ask">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </form>
        <div className="chips">
          {chips.map((c) => (
            <button key={c} type="button" onClick={() => ask(c)} data-ev="agent_chip">
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── recent work ───────────────────────── */
export function RecentWork() {
  return (
    <section className="work wrap">
      <p className="label">Recent work</p>
      <ProjectList items={projects.slice(0, 5)} />
      <div className="center">
        <Magnetic>
          <Link href="/work" className="pill-btn">
            <span>
              All projects <sup>{projects.length}</sup>
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}

/* ───────────────────────── sliding rows: teaching, certifications, services ───────────────────────── */
export function Rows() {
  const wrap = useRef<HTMLDivElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = wrap.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const p = (innerHeight - r.top) / (innerHeight + r.height);
          if (rowA.current) rowA.current.style.transform = `translate3d(${-p * 18}%,0,0)`;
          if (rowB.current) rowB.current.style.transform = `translate3d(${-18 + p * 18}%,0,0)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tilesA = [
    ...teaching.courses.map((c) => ({ k: c.id, href: "/teaching", top: "A course I teach", title: c.title, sub: c.format, tone: "#e9e6ff" })),
    { k: "community", href: "/about", top: "Community", title: "DevCorps AI Learners", sub: "I lead a community of people learning AI", tone: "#dff3ea" },
    { k: "edu", href: "/about", top: "Education", title: "B.(Hons) Computer Science", sub: "Herald College Kathmandu, 2023–2026", tone: "#fff4d6" },
  ];
  const tilesB = [
    ...certifications.map((c) => ({ k: c.id, href: "/about#certifications", top: c.issuer, title: c.code, sub: c.name, tone: "#ffe9df" })),
    ...services.slice(0, 2).map((s) => ({ k: s.id, href: "/contact", top: "You can hire me for", title: s.title, sub: s.engagement, tone: "#e7eefc" })),
  ];
  const Tile = (t: (typeof tilesA)[number], i: number) => (
    <Link key={t.k + i} href={t.href} className="tile" style={{ background: t.tone }} tabIndex={i >= tilesA.length + tilesB.length ? -1 : undefined}>
      <span className="label">{t.top}</span>
      <h3>{t.title}</h3>
      <p>{t.sub}</p>
    </Link>
  );

  return (
    <section ref={wrap} className="rows" aria-label="Teaching, certifications and services">
      <div ref={rowA} className="row">
        {[...tilesA, ...tilesA].map(Tile)}
      </div>
      <div ref={rowB} className="row">
        {[...tilesB, ...tilesB].map(Tile)}
      </div>
    </section>
  );
}
