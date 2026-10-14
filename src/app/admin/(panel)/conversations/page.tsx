import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { chatSessions, chatStats, type SessionFilter } from "@/lib/admin-data";
import { RangeParam } from "@/lib/schemas/analytics";
import { PageHead, Loading, BarList, ago, rangeMs } from "@/components/admin/ui";
import { parseUA } from "@/lib/request";

export const metadata = { title: "Conversations" };

export default function ConversationsPage({ searchParams }: PageProps<"/admin/conversations">) {
  return (
    <Suspense fallback={<Loading />}>
      <Conversations searchParams={searchParams} />
    </Suspense>
  );
}

async function Conversations({ searchParams }: Pick<PageProps<"/admin/conversations">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter: SessionFilter = (["flagged", "helpful", "unhelpful"] as const).find((f) => f === sp.filter) ?? "all";
  const stats = await chatStats(rangeMs(RangeParam.parse(sp.range ?? "30d")));
  const list = await chatSessions(filter);
  const tokens = (stats.tokens?.i ?? 0) + (stats.tokens?.o ?? 0);

  return (
    <>
      <PageHead title="Conversations" sub="Everything visitors asked your assistant, with a full trace of how each answer was made.">
        <nav className="seg">
          <Link href="/admin/conversations" className={filter === "all" ? "is-on" : ""}>
            All
          </Link>
          <Link href="/admin/conversations?filter=helpful" className={filter === "helpful" ? "is-on" : ""}>
            Rated helpful
          </Link>
          <Link href="/admin/conversations?filter=unhelpful" className={filter === "unhelpful" ? "is-on" : ""}>
            Rated not helpful
          </Link>
          <Link href="/admin/conversations?filter=flagged" className={filter === "flagged" ? "is-on" : ""}>
            Flagged by guardrails
          </Link>
        </nav>
      </PageHead>

      <div className="adm-grid adm-grid-4" style={{ marginBottom: "1rem" }}>
        <div className="adm-card kpi">
          <span className="kpi-label">Median answer time (30d)</span>
          <span className="kpi-value">{stats.p50 ? `${(stats.p50 / 1000).toFixed(1)}s` : "—"}</span>
        </div>
        <div className="adm-card kpi">
          <span className="kpi-label">Tokens used (30d)</span>
          <span className="kpi-value">{tokens.toLocaleString()}</span>
        </div>
        <div className="adm-card kpi">
          <span className="kpi-label">Visitor feedback (30d)</span>
          <span className="kpi-value">
            {stats.feedback?.up ?? 0} 👍 · {stats.feedback?.down ?? 0} 👎
          </span>
          <span className="kpi-delta">
            {(stats.feedback?.up ?? 0) + (stats.feedback?.down ?? 0)
              ? `${Math.round(((stats.feedback?.up ?? 0) / ((stats.feedback?.up ?? 0) + (stats.feedback?.down ?? 0))) * 100)}% of rated answers were helpful`
              : "No answers rated yet"}
          </span>
        </div>
        <div className="adm-card">
          <h2>Outcomes</h2>
          <BarList items={stats.byVerdict} format={(k) => ({ ok: "Answered", declined: "Declined (off-topic)", blocked: "Blocked by guardrail", error: "Error", aborted: "Stopped by visitor" })[k] ?? k} />
        </div>
      </div>

      <section className="adm-card adm-scroll">
        {list.length === 0 ? (
          <p className="empty">No conversations yet.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>First question</th>
                <th>Turns</th>
                <th>Feedback</th>
                <th>Where</th>
                <th>Device</th>
                <th className="num">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const ua = parseUA(s.user_agent ?? "");
                return (
                  <tr key={s.id}>
                    <td style={{ maxWidth: 480 }}>
                      <Link href={`/admin/conversations/${s.id}`} className="truncate-2">
                        {s.flagged ? <span className="pill warn" style={{ marginRight: 6 }}>flagged</span> : null}
                        {s.first_q ?? "—"}
                      </Link>
                    </td>
                    <td className="num">{s.turns}</td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>
                      {s.up || s.down ? `${s.up ? `👍 ${s.up}` : ""}${s.up && s.down ? "  " : ""}${s.down ? `👎 ${s.down}` : ""}` : "—"}
                    </td>
                    <td className="muted">{s.country ?? "—"}</td>
                    <td className="muted">
                      {ua.browser} · {ua.os}
                    </td>
                    <td className="num muted">{ago(s.last_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
