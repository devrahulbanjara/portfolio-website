"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/site/ErrorScreen";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report to the admin's error log.
    void fetch("/api/t", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: "err", path: location.pathname, message: `Page error: ${error.message}${error.digest ? ` (digest ${error.digest})` : ""}`.slice(0, 2000), stack: error.stack?.slice(0, 8000) }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <main className="wrap">
      <ErrorScreen
        code="Something went wrong"
        title="This page hit a problem"
        body="It's been logged and I'll look into it. Trying again usually works."
        action={
          <button type="button" className="pill-btn pill-btn-dark" onClick={reset}>
            <span>Try again</span>
          </button>
        }
      />
    </main>
  );
}
