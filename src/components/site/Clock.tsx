"use client";

import { useEffect, useState } from "react";

/** Live Kathmandu time (UTC+5:45). Renders a stable placeholder until mounted. */
export function KathmanduClock({ withSeconds = false, className }: { withSeconds?: boolean; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time is client-only
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", ...(withSeconds ? { second: "2-digit" } : {}) });
  return (
    <span className={`tnum ${className ?? ""}`} suppressHydrationWarning>
      {now ? fmt(now) : withSeconds ? "--:--:--" : "--:--"}
    </span>
  );
}

/** Current year, client-side (keeps server output static & cacheable). */
export function Year() {
  const [y, setY] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only value
  useEffect(() => setY(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{y ?? "2026"}</span>;
}
