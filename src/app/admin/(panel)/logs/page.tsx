import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { errors, auditLog } from "@/lib/admin-data";
import { PageHead, Loading, when } from "@/components/admin/ui";
import { ClearErrorsButton } from "./ClearErrorsButton";

export const metadata = { title: "Logs" };

const ACTION: Record<string, string> = {
  "login.success": "Signed in",
  "login.failed": "Failed sign-in attempt",
  "login.blocked": "Sign-in blocked (too many attempts)",
  logout: "Signed out",
  "post.create": "Created a post",
  "post.update": "Updated a post",
  "post.delete": "Deleted a post",
  "message.delete": "Deleted a message",
  "settings.update": "Changed settings",
  "llm.breaker.reset": "Reset model cooldowns",
  "password.change": "Changed password",
  "media.upload": "Uploaded an image",
  "logs.clear": "Cleared the error log",
  "agent.action": "Assistant made a change",
};

export default function LogsPage({ searchParams }: PageProps<"/admin/logs">) {
  return (
    <Suspense fallback={<Loading />}>
      <Logs searchParams={searchParams} />
    </Suspense>
  );
}

async function Logs({ searchParams }: Pick<PageProps<"/admin/logs">, "searchParams">) {
  await requireAdmin();
  const tab = (await searchParams).tab === "audit" ? "audit" : "errors";
  return (
    <>
      <PageHead title="Logs" sub="Errors from visitors' browsers and the server, and a record of every admin action.">
        <nav className="seg">
          <Link href="/admin/logs" className={tab === "errors" ? "is-on" : ""}>
            Errors
          </Link>
          <Link href="/admin/logs?tab=audit" className={tab === "audit" ? "is-on" : ""}>
            Security & changes
          </Link>
        </nav>
      </PageHead>
      <section className="adm-card adm-scroll">
        {tab === "errors" ? <ErrorTable /> : <AuditTable />}
      </section>
    </>
  );
}

async function ErrorTable() {
  const rows = await errors();
  if (!rows.length) return <p className="empty">No errors recorded. 🎉</p>;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.8rem" }}>
        <ClearErrorsButton />
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Last seen</th>
            <th>Where</th>
            <th>Message</th>
            <th className="num">Times</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={i}>
              <td className="muted" style={{ whiteSpace: "nowrap" }}>
                {when(e.last)}
              </td>
              <td>
                <span className={`pill ${e.level === "error" ? "bad" : "warn"}`}>{e.source}</span>
              </td>
              <td style={{ maxWidth: 560 }}>
                <details>
                  <summary className="truncate-2" style={{ cursor: "pointer" }}>
                    {e.message}
                  </summary>
                  {e.stack && <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", marginTop: 8, color: "var(--muted)" }}>{e.stack}</pre>}
                  <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    First seen {when(e.first)}
                  </p>
                </details>
              </td>
              <td className="num">{e.n.toLocaleString()}</td>
              <td className="muted">{e.path ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

async function AuditTable() {
  const rows = await auditLog();
  if (!rows.length) return <p className="empty">Nothing yet.</p>;
  return (
    <table className="adm-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Action</th>
          <th>IP</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a.id}>
            <td className="muted" style={{ whiteSpace: "nowrap" }}>
              {when(a.ts)}
            </td>
            <td>
              <span className={`pill ${a.action.includes("failed") || a.action.includes("blocked") ? "bad" : a.action.startsWith("login") ? "ok" : ""}`}>{ACTION[a.action] ?? a.action}</span>
            </td>
            <td className="muted">{a.ip ?? "—"}</td>
            <td className="muted" style={{ maxWidth: 420, fontSize: 13 }}>
              {a.target ? `${a.target} ` : ""}
              {a.meta ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
