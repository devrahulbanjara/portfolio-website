"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/markdown";

export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.querySelector("[data-article]");
    const on = () => {
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      bar.current.style.transform = `scaleX(${p})`;
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return <div ref={bar} className="read-progress" aria-hidden />;
}

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const heads = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);
  if (!items.length) return <div />;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="label" style={{ marginBottom: "0.8rem" }}>On this page</p>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className={`lvl-${i.depth} ${active === i.id ? "is-active" : ""}`}>
          {i.text}
        </a>
      ))}
    </nav>
  );
}

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  return (
    <div className="share">
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer" data-ev="share" data-ev-net="linkedin">
        LinkedIn
      </a>
      <a href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer" data-ev="share" data-ev-net="x">
        X
      </a>
      <button
        type="button"
        
        data-ev="share"
        data-ev-net="copy"
        onClick={() => {
          void navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

/** Adds a copy button to every code block in the article. */
export function CodeCopy() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-article] figure[data-rehype-pretty-code-figure]").forEach((fig) => {
      if (fig.querySelector(".code-copy")) return;
      const b = document.createElement("button");
      b.className = "code-copy";
      b.type = "button";
      b.textContent = "copy";
      b.onclick = () => {
        void navigator.clipboard?.writeText(fig.querySelector("pre")?.innerText ?? "");
        b.textContent = "copied";
        setTimeout(() => (b.textContent = "copy"), 1400);
      };
      fig.appendChild(b);
    });
  }, []);
  return null;
}
