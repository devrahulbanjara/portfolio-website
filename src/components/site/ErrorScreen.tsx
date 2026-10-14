import Link from "next/link";

/** Shared look for 404 / error pages: big plain message, two clear ways forward. */
export function ErrorScreen({ code, title, body, action }: { code: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="err-screen">
      <p className="label">{code}</p>
      <h1 className="page-title" style={{ marginTop: "1rem" }}>
        {title}
      </h1>
      <p className="page-lede">{body}</p>
      <div className="err-actions">
        {action}
        <Link href="/" className="pill-btn pill-btn-dark">
          <span>Back to the homepage</span>
        </Link>
        <Link href="/contact" className="pill-btn">
          <span>Contact Rahul</span>
        </Link>
      </div>
    </section>
  );
}
