"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/profile";
import { kindOf } from "@/lib/format";

/**
 * Big project rows. Hovering one dims the others and shows a floating brief —
 * what the project is, the problem, my role, the stack and the headline result.
 * Clicking opens the case study.
 */
export function ProjectList({ items }: { items: Project[] }) {
  const [active, setActive] = useState<number | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -500, y: -500 });

  useEffect(() => {
    let raf = 0;
    const pos = { x: -500, y: -500, cx: -500, cy: -500 };
    const loop = () => {
      const t = target.current;
      pos.x += (t.x - pos.x) * 0.1;
      pos.y += (t.y - pos.y) * 0.1;
      pos.cx += (t.x - pos.cx) * 0.3;
      pos.cy += (t.y - pos.cy) * 0.3;
      // keep the brief on screen: flip to the left half when the cursor is on the right
      const w = card.current?.offsetWidth ?? 420;
      const h = card.current?.offsetHeight ?? 360;
      const left = pos.x + 40 + w > innerWidth - 20 ? pos.x - 40 - w : pos.x + 40;
      const top = Math.min(innerHeight - h - 20, Math.max(20, pos.y - h / 2));
      if (card.current) card.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      if (cursor.current) cursor.current.style.transform = `translate3d(${pos.cx}px, ${pos.cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="projects" onPointerMove={(e) => (target.current = { x: e.clientX, y: e.clientY })}>
      <ul className={`project-list ${active !== null ? "has-active" : ""}`} onPointerLeave={() => setActive(null)}>
        {items.map((p, i) => (
          <li key={p.slug} className={active === i ? "is-active" : ""}>
            <Link href={`/work/${p.slug}`} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} data-ev="work_click" data-ev-slug={p.slug}>
              <span className="project-title">{p.title}</span>
              <span className="project-kind">
                {[kindOf(p), p.status === "In progress" && "In progress", p.year].filter(Boolean).join(" · ")}
              </span>
              <span className="project-tagline">{p.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div ref={card} className={`brief ${active !== null ? "is-on" : ""}`} aria-hidden>
        <div className="brief-inner">
          <div className="brief-strip" style={{ transform: `translateY(${-(active ?? 0) * 100}%)` }}>
            {items.map((p) => (
              <article key={p.slug} className="brief-slide" style={{ ["--c" as string]: p.accent }}>
                <p className="brief-meta">
                  <span className="brief-dot" />
                  {[kindOf(p), p.status, p.year].filter(Boolean).join(" · ")}
                </p>
                <h3>{p.title}</h3>
                <p className="brief-what">{p.tagline}</p>
                <dl>
                  <div>
                    <dt>{p.problem ? "The problem" : "In short"}</dt>
                    <dd>{clip(p.problem ?? p.summary, 150)}</dd>
                  </div>
                  {p.role && (
                    <div>
                      <dt>My role</dt>
                      <dd>{p.role}</dd>
                    </div>
                  )}
                </dl>
                {p.results[0] && (
                  <p className="brief-result">
                    <strong>{p.results[0].value}</strong> {p.results[0].metric.toLowerCase()}
                  </p>
                )}
                <p className="brief-stack">{p.stack.slice(0, 4).join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div ref={cursor} className={`view-cursor ${active !== null ? "is-on" : ""}`} aria-hidden>
        <span>Open</span>
      </div>
    </div>
  );
}

const clip = (t: string, n: number) => (t.length > n ? t.slice(0, n - 2).replace(/\s\S*$/, "") + "…" : t);
