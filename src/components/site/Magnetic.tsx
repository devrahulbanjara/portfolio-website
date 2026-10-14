"use client";

import { useEffect, useRef } from "react";

/** Wraps a child so it (and its inner label) drift toward the cursor, then spring back. */
export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(hover: none)").matches) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      if (inner) inner.style.transform = `translate3d(${x * strength * 0.4}px, ${y * strength * 0.4}px, 0)`;
    };
    const leave = () => {
      el.style.transform = "";
      if (inner) inner.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={`magnetic ${className ?? ""}`}>
      {children}
    </div>
  );
}
