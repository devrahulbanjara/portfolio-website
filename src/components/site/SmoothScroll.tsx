"use client";

import Lenis from "lenis";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Smooth wheel scrolling (off for prefers-reduced-motion). Resets to top on navigation. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), anchors: { offset: -40 } });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the instance only exists client-side
    setLenis(l);
    (window as unknown as { __lenis?: Lenis }).__lenis = l;
    return () => l.destroy();
  }, []);

  return (
    <>
      <Suspense>
        <ScrollReset lenis={lenis} />
      </Suspense>
      {children}
    </>
  );
}

function ScrollReset({ lenis }: { lenis: Lenis | null }) {
  const pathname = usePathname();
  useEffect(() => {
    if (location.hash) return;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}
