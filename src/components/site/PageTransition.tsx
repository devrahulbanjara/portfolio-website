"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Name shown on the curtain while the next page loads. */
function labelFor(path: string) {
  const first = path.split("/")[1] ?? "";
  const names: Record<string, string> = { "": "Home", work: "Projects", about: "About & experience", teaching: "Teaching", blog: "Blog", contact: "Contact", services: "Services", resume: "Résumé" };
  return names[first] ?? first.charAt(0).toUpperCase() + first.slice(1);
}

type Phase = "idle" | "cover" | "reveal";
const COVER_MS = 750;

/**
 * Dark curtain with a curved edge that sweeps up over the page, names where
 * you're going, then lifts off once the new route has rendered.
 * Intercepts plain left-clicks on internal links; everything else (new tab,
 * hash links, downloads, same page) behaves normally.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const pending = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || /\.\w+$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // same page (incl. #hash): let it scroll
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      const href = url.pathname + url.search + url.hash;
      pending.current = { path: url.pathname, at: Date.now() };
      router.prefetch(href);
      setLabel(labelFor(url.pathname));
      setPhase("cover");
      setTimeout(() => router.push(href), COVER_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // New route is on screen: lift the curtain (after the cover has fully closed).
  useEffect(() => {
    const p = pending.current;
    if (!p || p.path !== pathname) return;
    pending.current = null;
    const wait = Math.max(0, p.at + COVER_MS + 250 - Date.now());
    const t1 = setTimeout(() => {
      window.scrollTo(0, 0);
      setPhase("reveal");
    }, wait);
    const t2 = setTimeout(() => setPhase("idle"), wait + 950);
    return () => (clearTimeout(t1), clearTimeout(t2));
  }, [pathname]);

  // Safety net: never leave the curtain down if navigation fails.
  useEffect(() => {
    if (phase !== "cover") return;
    const t = setTimeout(() => {
      pending.current = null;
      setPhase("reveal");
      setTimeout(() => setPhase("idle"), 950);
    }, 10_000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className={`pt is-${phase}`} aria-hidden>
      <svg className="pt-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 100 Q500 0 1000 100 Z" />
      </svg>
      <p className="pt-label">
        <span className="preloader-dot" />
        {label}
      </p>
      <svg className="pt-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 0 Q500 100 1000 0 Z" />
      </svg>
    </div>
  );
}
