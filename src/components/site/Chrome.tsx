"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { person } from "@/content/profile";
import { useAgent } from "@/components/agent/AgentProvider";
import { AgentMark } from "@/components/agent/AgentMark";
import { KathmanduClock } from "./Clock";
import { Magnetic } from "./Magnetic";
import { track } from "./Analytics";

export const NAV = [
  { href: "/work", label: "Projects" },
  { href: "/about", label: "About & experience" },
  { href: "/teaching", label: "Teaching" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

/* ───────────────────────── preloader: greetings on every fresh load ───────────────────────── */
const GREETINGS = ["Hello", "नमस्ते", "Bonjour", "Hola", "Ciao", "こんにちは", "Hallo", "Olá", "안녕하세요", "Привет", "你好", "مرحبا", "Hej"];

export function Preloader() {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(setTimeout(() => setDone(true), 300));
      return () => timers.forEach(clearTimeout);
    }
    // "Hello" lingers, the rest flick past, then the curtain lifts.
    let t = 750;
    for (let k = 1; k < GREETINGS.length; k++, t += 140) timers.push(setTimeout(() => setI(k), t));
    timers.push(setTimeout(() => setDone(true), t + 250));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className={`preloader ${done ? "is-done" : ""}`} aria-hidden>
      <p key={i} className="preloader-word">
        <span className="preloader-dot" />
        {GREETINGS[i]}
      </p>
      <svg className="preloader-curve" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 0 Q500 100 1000 0 L1000 0 L0 0Z" />
      </svg>
    </div>
  );
}

/* ───────────────────────── top bar + floating agent orb ───────────────────────── */
export function TopBar() {
  const pathname = usePathname();
  const onPhoto = pathname === "/" || pathname === "/work/omarchy-ocr";
  const { setOpen, busy } = useAgent();
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menu = menuPath === pathname;
  const setMenu = (open: boolean) => setMenuPath(open ? pathname : null);

  useEffect(() => {
    const on = () => setScrolled(scrollY > innerHeight * 0.35);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <header className={`topbar ${onPhoto ? "on-photo" : ""}`}>
        <Link href="/" className="logo" aria-label={`${person.name} — home`}>
          <span className="logo-c">©</span>
          <span className="logo-roll">
            <span>Code by Rahul</span>
            <span>{person.name}</span>
          </span>
        </Link>
        <nav aria-label="Primary">
          {NAV.map((n) => (
            <Magnetic key={n.href} strength={0.25}>
              <Link href={n.href} className={`nav-link ${pathname.startsWith(n.href) ? "is-active" : ""}`}>
                <span>{n.label}</span>
              </Link>
            </Magnetic>
          ))}
        </nav>
        <button type="button" className="nav-menu-btn" onClick={() => setMenu(true)} aria-label="Open menu">
          Menu
        </button>
      </header>

      {/* floating controls once you scroll: ask the assistant, open the menu */}
      <div className={`orbs ${scrolled ? "is-on" : ""}`}>
        <Magnetic strength={0.4}>
          <button type="button" className={`orb orb-ask ${busy ? "is-busy" : ""}`} onClick={() => setOpen(true)} aria-label="Ask my AI assistant" data-ev="agent_orb">
            <AgentMark active={busy} size={22} />
          </button>
        </Magnetic>
        <Magnetic strength={0.4}>
          <button type="button" className="orb" onClick={() => setMenu(true)} aria-label="Open menu">
            <span className="orb-burger">
              <span />
              <span />
            </span>
          </button>
        </Magnetic>
      </div>

      <MenuSheet open={menu} onClose={() => setMenu(false)} onAsk={() => {
        setMenu(false);
        setOpen(true);
      }} />
    </>
  );
}

function MenuSheet({ open, onClose, onAsk }: { open: boolean; onClose: () => void; onAsk: () => void }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <>
      <div className={`sheet-scrim ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden />
      <aside className={`menu-sheet ${open ? "is-open" : ""}`} aria-label="Menu" aria-hidden={!open} inert={!open}>
        <svg className="sheet-curve" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden>
          <path />
        </svg>
        <div className="menu-head">
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close menu">
            <span />
            <span />
          </button>
        </div>
        <div className="menu-body">
          <p className="label menu-label">Navigation</p>
          <ul className="menu-links">
            {[{ href: "/", label: "Home" }, ...NAV].map((n, i) => (
              <li key={n.href} style={{ ["--i" as string]: i }}>
                <Link href={n.href} className={pathname === n.href ? "is-active" : ""} onClick={onClose}>
                  <span className="menu-dot" />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className="menu-ask" onClick={onAsk}>
            <AgentMark active={false} size={16} /> Ask my AI assistant
          </button>
        </div>
        <div className="menu-foot">
          <p className="label menu-label">Socials</p>
          <div>
            {person.socials
              .filter((s) => s.label !== "Email")
              .map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ───────────────────────── footer: curved dark "let's work together" ───────────────────────── */
export function Footer() {
  const curve = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = curve.current?.parentElement;
      if (el && curve.current) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight - r.top) / innerHeight));
        curve.current.style.height = `${(1 - p) * 140}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <footer className="footer">
      <div ref={curve} className="curve" aria-hidden />
      <div className="wrap footer-inner">
        <div className="footer-head">
          {/* eslint-disable-next-line @next/next/no-img-element -- small local avatar */}
          <img src="/portrait-photo.png" alt="" className="avatar" width={96} height={96} />
          <h2>
            Let&apos;s work
            <br />
            together
          </h2>
        </div>
        <div className="footer-line">
          <Magnetic strength={0.45} className="footer-cta">
            <Link href="/contact" className="circle-btn circle-btn-accent" data-ev="cta_click" data-ev-where="footer">
              <span>Get in touch</span>
            </Link>
          </Magnetic>
        </div>
        <div className="footer-pills">
          <Magnetic strength={0.2}>
            <button
              type="button"
              className="outline-pill"
              onClick={() => {
                void navigator.clipboard?.writeText(person.email);
                setCopied(true);
                track("email_copy");
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              <span>{copied ? "Email copied ✓" : person.email}</span>
            </button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <Link href="/resume" className="outline-pill" data-ev="cta_click" data-ev-where="footer_resume">
              <span>My résumé</span>
            </Link>
          </Magnetic>
        </div>
        <div className="footer-meta">
          <div>
            <span className="label">Local time</span>
            <span>
              <KathmanduClock /> in Kathmandu
            </span>
          </div>
          <div>
            <span className="label">Socials</span>
            <span className="footer-links">
              {person.socials
                .filter((s) => s.label !== "Email")
                .map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer me" data-ev="social_click" data-ev-network={s.label}>
                    {s.label}
                  </a>
                ))}
            </span>
          </div>
        </div>
        <p className="footer-love">Made with ❤️ by Rahul</p>
      </div>
    </footer>
  );
}
