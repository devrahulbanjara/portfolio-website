"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

const ENDPOINT = "/api/t";

function sid(): string {
  try {
    let s = sessionStorage.getItem("rdb_sid");
    if (!s) {
      s = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      sessionStorage.setItem("rdb_sid", s);
    }
    return s;
  } catch {
    return "nostorage000";
  }
}

function send(body: object, beacon = false) {
  const json = JSON.stringify(body);
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([json], { type: "application/json" }));
    return Promise.resolve(null);
  }
  return fetch(ENDPOINT, { method: "POST", body: json, headers: { "Content-Type": "application/json" }, keepalive: true })
    .then((r) => (r.status === 200 ? r.json() : null))
    .catch(() => null);
}

/** Fire a named event from anywhere: track("cta_click", { where: "hero" }) */
export function track(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  void send({ k: "ev", sid: sid(), name, path: location.pathname, props });
}

/**
 * First-party analytics: pageviews, engaged time, scroll depth, custom events
 * (any element with data-ev="name" is tracked on click), web vitals, errors.
 */
export function Analytics() {
  const pathname = usePathname();
  const view = useRef<{ id: number; start: number; active: number; lastActive: number; scroll: number } | null>(null);

  useReportWebVitals((m) => {
    void send({ k: "vital", path: location.pathname, name: m.name, value: Math.round(m.value * 1000) / 1000, rating: m.rating }, true);
  });

  // pageview per route
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const flush = () => {
      const v = view.current;
      if (!v || !v.id) return;
      const ms = v.active + (document.visibilityState === "visible" ? Date.now() - v.lastActive : 0);
      void send({ k: "ping", id: v.id, sid: sid(), ms: Math.min(ms, 6 * 3600_000), scroll: v.scroll }, true);
    };
    flush(); // previous route
    const v = { id: 0, start: Date.now(), active: 0, lastActive: Date.now(), scroll: 0 };
    view.current = v;
    const t = setTimeout(() => {
      void send({
        k: "pv",
        sid: sid(),
        path: location.pathname + location.search,
        title: document.title,
        ref: document.referrer || undefined,
        screen: `${screen.width}x${screen.height}`,
        lang: navigator.language,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).then((r: { id?: number } | null) => {
        if (r?.id) v.id = r.id;
      });
    }, 50); // let <title> update after navigation
    return () => clearTimeout(t);
  }, [pathname]);

  // engagement: active time + scroll depth
  useEffect(() => {
    const onVis = () => {
      const v = view.current;
      if (!v) return;
      if (document.visibilityState === "hidden") {
        v.active += Date.now() - v.lastActive;
        if (v.id) void send({ k: "ping", id: v.id, sid: sid(), ms: v.active, scroll: v.scroll }, true);
      } else v.lastActive = Date.now();
    };
    const onScroll = () => {
      const v = view.current;
      if (!v) return;
      const h = document.documentElement.scrollHeight - innerHeight;
      const pct = h > 0 ? Math.round((scrollY / h) * 100) : 100;
      if (pct > v.scroll) v.scroll = Math.min(100, pct);
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-ev]");
      if (!el) return;
      const props: Record<string, string> = {};
      for (const [k, val] of Object.entries(el.dataset)) if (k.startsWith("ev") && k !== "ev" && val) props[k.slice(2).toLowerCase()] = val;
      track(el.dataset.ev!, props);
    };
    const onError = (e: ErrorEvent) => void send({ k: "err", path: location.pathname, message: String(e.message).slice(0, 2000), stack: e.error?.stack?.slice(0, 8000) }, true);
    const onRejection = (e: PromiseRejectionEvent) =>
      void send({ k: "err", path: location.pathname, message: `Unhandled rejection: ${String(e.reason?.message ?? e.reason).slice(0, 1900)}`, stack: e.reason?.stack?.slice(0, 8000) }, true);

    document.addEventListener("visibilitychange", onVis);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("click", onClick, { capture: true });
    addEventListener("error", onError);
    addEventListener("unhandledrejection", onRejection);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("scroll", onScroll);
      removeEventListener("click", onClick, { capture: true });
      removeEventListener("error", onError);
      removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
