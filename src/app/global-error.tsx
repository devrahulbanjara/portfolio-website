"use client";

/** Last-resort screen if the root layout itself fails. Plain HTML so it can't fail too. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#fff", color: "#1c1d20" }}>
        <div style={{ maxWidth: 480, padding: 24 }}>
          <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", fontWeight: 500 }}>The site hit a problem</h1>
          <p style={{ color: "#6b6c72", lineHeight: 1.6 }}>Please try again in a moment. If it keeps happening, email rdbanjara07@gmail.com.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 22px", borderRadius: 99, border: 0, background: "#1c1d20", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
