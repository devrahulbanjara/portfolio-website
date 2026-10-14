import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { overview, series, liveNow, messages, analytics, satisfaction } from "@/lib/admin-data";
import { providerStatus } from "@/lib/agent/router";
import { RangeParam } from "@/lib/schemas/analytics";
import { PageHead, RangePicker, Kpi, TrafficChart, BarList, ago, rangeMs, Loading } from "@/components/admin/ui";

export const metadata = { title: "Overview" };

export default function OverviewPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<Loading />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  const range = RangeParam.parse((await searchParams).range);
  const ms = rangeMs(range);
  const o = await overview(ms);
  const data = await series(ms, range === "24h" ? 24 : range === "7d" ? 28 : 30);
  const live = await liveNow();
  const inbox = (await messages("inbox")).slice(0, 4);
  const a = await analytics(ms);
  const models = await providerStatus();
  const sat = await satisfaction(ms);

  return (
    <>
      <PageHead title="Overview" sub="How the site is doing, at a glance.">
        <RangePicker base="/admin" range={range} />
      </PageHead>

      <div className="adm-grid adm-grid-4">
        <Kpi label="Visitors" value={o.visitors.now} prev={o.visitors.prev} />
        <Kpi label="Pageviews" value={o.pageviews.now} prev={o.pageviews.prev} />
        <Kpi label="Questions to the assistant" value={o.chats.now} prev={o.chats.prev} />
        <Kpi label="Unread messages" value={o.unread} />
        <Link href="/admin/conversations?filter=unhelpful" className="adm-card kpi">
          <span className="kpi-label">Assistant rated helpful</span>
          <span className="kpi-value">{sat.pct === null ? "—" : `${sat.pct}%`}</span>
          <span className="kpi-delta">
            {sat.rated ? `${sat.up} 👍 · ${sat.down} 👎 — see unhelpful answers →` : "No ratings yet"}
          </span>
        </Link>
      </div>

      <div className="adm-grid" style={{ marginTop: "1rem", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)" }}>
        <section className="adm-card">
          <h2>Traffic</h2>
          <TrafficChart data={data} rangeMs={ms} />
        </section>
        <section className="adm-card">
          <h2>
            Right now <span className="pill ok">{live.length} active</span>
          </h2>
          {live.length ? (
            <ul className="barlist">
              {live.map((v, i) => (
                <li key={i}>
                  <span>{v.path}</span>
                  <span className="muted">
                    {v.country ?? "??"} · {v.device} · {ago(v.ts)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Nobody on the site in the last 5 minutes.</p>
          )}
          <h2 style={{ marginTop: "1.4rem" }}>Health</h2>
          <ul className="barlist">
            <li>
              <span>Avg. time on page</span>
              <span>{o.avgEngagedSec}s</span>
            </li>
            <li>
              <span>Assistant avg. response</span>
              <span>{(o.chatLatency / 1000).toFixed(1)}s</span>
            </li>
            <li>
              <span>Errors in period</span>
              <span>{o.errors}</span>
            </li>
            {models.map((m) => (
              <li key={m.id}>
                <span>
                  {m.id} · {m.model}
                </span>
                <span className={`pill ${!m.configured ? "" : m.limited ? "warn" : "ok"}`}>{!m.configured ? "no key" : m.limited ? "cooling down" : "ready"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="adm-grid adm-grid-3" style={{ marginTop: "1rem" }}>
        <section className="adm-card">
          <h2>
            Top pages <Link href={`/admin/analytics?range=${range}`}>All →</Link>
          </h2>
          <BarList items={a.pages.slice(0, 6)} />
        </section>
        <section className="adm-card">
          <h2>Where visitors come from</h2>
          <BarList items={a.referrers.slice(0, 6)} />
        </section>
        <section className="adm-card">
          <h2>
            Latest messages <Link href="/admin/messages">Inbox →</Link>
          </h2>
          {inbox.length ? (
            <ul className="barlist">
              {inbox.map((m) => (
                <li key={m.id}>
                  <span>
                    {!m.read && <b style={{ color: "var(--accent)" }}>● </b>}
                    {m.name} — {m.message.slice(0, 60)}
                  </span>
                  <span className="muted">{ago(m.ts)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No messages yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
