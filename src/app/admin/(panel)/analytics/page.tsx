import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { analytics, overview, series } from "@/lib/admin-data";
import { RangeParam } from "@/lib/schemas/analytics";
import { PageHead, RangePicker, Kpi, TrafficChart, BarList, Loading, rangeMs } from "@/components/admin/ui";

export const metadata = { title: "Analytics" };

/** Core Web Vitals thresholds (good / needs improvement), per web.dev. */
const VITALS: Record<string, { unit: string; good: number; poor: number; label: string }> = {
  LCP: { unit: "s", good: 2500, poor: 4000, label: "Largest contentful paint" },
  INP: { unit: "ms", good: 200, poor: 500, label: "Interaction to next paint" },
  CLS: { unit: "", good: 0.1, poor: 0.25, label: "Cumulative layout shift" },
  FCP: { unit: "s", good: 1800, poor: 3000, label: "First contentful paint" },
  TTFB: { unit: "ms", good: 800, poor: 1800, label: "Time to first byte" },
};

const EVENT_LABEL: Record<string, string> = {
  cta_click: "Clicked a call-to-action",
  agent_open: "Opened the assistant",
  agent_ask: "Asked the assistant",
  agent_chip: "Used a suggested question",
  agent_suggestion: "Used a suggestion in the panel",
  agent_card: "Clicked a card from the assistant",
  work_click: "Opened a project",
  post_click: "Opened an article",
  contact_open: "Opened the contact page",
  contact_submit: "Sent a contact message",
  contact_submit_click: "Pressed Send on the contact form",
  email_copy: "Copied your email",
  social_click: "Clicked a social link",
  cert_click: "Opened a certificate",
  share: "Shared an article",
  agent_orb: "Opened the assistant (floating button)",
  agent_reset: "Started a new chat",
};

export default function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  return (
    <Suspense fallback={<Loading />}>
      <Analytics searchParams={searchParams} />
    </Suspense>
  );
}

async function Analytics({ searchParams }: Pick<PageProps<"/admin/analytics">, "searchParams">) {
  await requireAdmin();
  const range = RangeParam.parse((await searchParams).range);
  const ms = rangeMs(range);
  const o = await overview(ms);
  const a = await analytics(ms);
  const data = await series(ms, range === "24h" ? 24 : 30);
  const fmtV = (name: string, v: number) => {
    const m = VITALS[name];
    if (!m) return v.toFixed(2);
    return m.unit === "s" ? `${(v / 1000).toFixed(2)}s` : m.unit === "ms" ? `${Math.round(v)}ms` : v.toFixed(3);
  };

  return (
    <>
      <PageHead title="Analytics" sub="Private, cookie-free stats. Visitors are counted with a daily-rotating anonymous hash — no personal data stored.">
        <RangePicker base="/admin/analytics" range={range} />
      </PageHead>

      <div className="adm-grid adm-grid-4">
        <Kpi label="Visitors" value={o.visitors.now} prev={o.visitors.prev} />
        <Kpi label="Pageviews" value={o.pageviews.now} prev={o.pageviews.prev} />
        <Kpi label="Avg. time on page" value={o.avgEngagedSec} suffix="s" />
        <Kpi label="Bot visits filtered out" value={a.bots} />
      </div>

      <section className="adm-card" style={{ marginTop: "1rem" }}>
        <h2>Traffic</h2>
        <TrafficChart data={data} rangeMs={ms} />
      </section>

      <div className="adm-grid adm-grid-2" style={{ marginTop: "1rem" }}>
        <section className="adm-card adm-scroll">
          <h2>Pages</h2>
          {a.pages.length ? (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="num">Views</th>
                  <th className="num">Avg. time</th>
                  <th className="num">Scrolled</th>
                </tr>
              </thead>
              <tbody>
                {a.pages.map((p) => (
                  <tr key={p.key}>
                    <td>{p.key}</td>
                    <td className="num">{p.n}</td>
                    <td className="num muted">{p.avg ? `${Math.round(p.avg / 1000)}s` : "—"}</td>
                    <td className="num muted">{p.scroll != null ? `${Math.round(p.scroll)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No visits in this period.</p>
          )}
        </section>
        <section className="adm-card">
          <h2>What visitors did</h2>
          <BarList items={a.events} format={(k) => EVENT_LABEL[k] ?? k} empty="No interactions recorded yet." />
        </section>
        <section className="adm-card">
          <h2>Referrers</h2>
          <BarList items={a.referrers} />
        </section>
        <section className="adm-card">
          <h2>Countries</h2>
          <BarList items={a.countries} empty="Country needs a proxy header (e.g. Cloudflare) — see time zones instead." />
          <h2 style={{ marginTop: "1.2rem" }}>Visitor time zones</h2>
          <BarList items={a.timezones} />
        </section>
        <section className="adm-card">
          <h2>Devices</h2>
          <BarList items={a.devices} />
          <h2 style={{ marginTop: "1.2rem" }}>Browsers</h2>
          <BarList items={a.browsers} />
        </section>
        <section className="adm-card">
          <h2>Speed — Core Web Vitals (75th percentile)</h2>
          {a.vitals.length ? (
            <ul className="barlist">
              {a.vitals.map((v) => {
                const m = VITALS[v.name];
                const cls = !m ? "" : v.p75 <= m.good ? "ok" : v.p75 <= m.poor ? "warn" : "bad";
                return (
                  <li key={v.name}>
                    <span>
                      {v.name} <span className="muted">· {m?.label}</span>
                    </span>
                    <span className={`pill ${cls}`}>{fmtV(v.name, v.p75)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty">Collected from real visitors as they browse.</p>
          )}
        </section>
      </div>
    </>
  );
}
