"use client";

import { useEffect, useRef, useState } from "react";
import type { Certification } from "@/content/profile";
import { fmtMonth } from "@/lib/format";

type Badged = Certification & { badge: NonNullable<Certification["badge"]> };

/** Digital badges on a dark stage — each tilts toward the cursor and catches a sheen clipped to its shape. */
export function BadgeShowcase({ certs }: { certs: Certification[] }) {
  const badged = certs.filter((c): c is Badged => !!c.badge);
  const brands = [...new Set(badged.map((c) => c.badge.brand))];
  const [filter, setFilter] = useState<string | null>(null);
  const items = filter ? badged.filter((c) => c.badge.brand === filter) : badged;
  return (
    <>
      <div className="filters badge-filters" role="group" aria-label="Filter badges">
        <button type="button" className={filter === null ? "is-on" : ""} onClick={() => setFilter(null)} aria-pressed={filter === null}>
          All <sup>{badged.length}</sup>
        </button>
        {brands.map((b) => (
          <button key={b} type="button" className={filter === b ? "is-on" : ""} onClick={() => setFilter(b)} aria-pressed={filter === b}>
            {b} <sup>{badged.filter((c) => c.badge.brand === b).length}</sup>
          </button>
        ))}
      </div>
      <ul className="badges">
        {items.map((c, i) => (
          <li key={c.id} data-reveal style={{ ["--d" as string]: i }}>
            <BadgeCard c={c} />
          </li>
        ))}
      </ul>
    </>
  );
}

function BadgeCard({ c }: { c: Badged }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${x * 22}deg`);
      el.style.setProperty("--rx", `${-y * 22}deg`);
      el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    };
    const leave = () => ["--rx", "--ry", "--mx"].forEach((p) => el.style.removeProperty(p));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={c.badge.url}
      target="_blank"
      rel="noopener noreferrer"
      className="badge-card"
      style={{ ["--glow" as string]: c.badge.glow }}
      data-ev="cert_click"
      data-ev-cert={c.id}
    >
      <div className="badge-stage">
        <div className={`badge-art ${c.badge.certificate ? "is-cert" : ""}`} style={{ ["--src" as string]: `url(${c.badge.image})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local badge art */}
          <img src={c.badge.image} alt={`${c.name} ${c.badge.certificate ? "certificate" : "badge"}`} width={c.badge.certificate ? 900 : 600} height={c.badge.certificate ? 638 : 600} />
          <span className="badge-sheen" aria-hidden />
        </div>
      </div>
      <div className="badge-info">
        <span className="badge-verified">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M8 1.2 9.8 2.6l2.3-.1.7 2.2 1.9 1.3-.8 2.1.8 2.1-1.9 1.3-.7 2.2-2.3-.1L8 14.8l-1.8-1.4-2.3.1-.7-2.2-1.9-1.3.8-2.1-.8-2.1 1.9-1.3.7-2.2 2.3.1Z" fill="currentColor" />
            <path d="m5.4 8.1 1.8 1.8 3.5-3.6" fill="none" stroke="#121316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {c.badge.source}
        </span>
        <h3 className="badge-name">{c.name}</h3>
        <p className="badge-meta">
          {c.issuer} · <span>{c.code}</span>
        </p>
        <p className="badge-dates">
          <span>Earned {fmtMonth(c.issued)}</span>
          {c.expires && (
            <>
              {" · "}
              <span>Valid until {fmtMonth(c.expires)}</span>
            </>
          )}
        </p>
        <span className="badge-cta">View credential ↗</span>
      </div>
    </a>
  );
}
