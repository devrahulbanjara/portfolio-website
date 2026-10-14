import Link from "next/link";
import { RANGE_MS, type Range } from "@/lib/schemas/analytics";

export const RANGES: Range[] = ["24h", "7d", "30d", "90d"];

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="adm-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </header>
  );
}

export function RangePicker({ base, range }: { base: string; range: Range }) {
  return (
    <nav className="seg" aria-label="Time range">
      {RANGES.map((r) => (
        <Link key={r} href={`${base}?range=${r}`} className={r === range ? "is-on" : ""}>
          {r}
        </Link>
      ))}
    </nav>
  );
}
export const rangeMs = (r: Range) => RANGE_MS[r];

export function Kpi({ label, value, prev, suffix = "" }: { label: string; value: number; prev?: number; suffix?: string }) {
  let delta: React.ReactNode = null;
  if (prev !== undefined) {
    if (prev === 0) delta = <span className="kpi-delta">{value ? "new" : "—"} vs previous period</span>;
    else {
      const pct = Math.round(((value - prev) / prev) * 100);
      delta = <span className={`kpi-delta ${pct > 0 ? "up" : pct < 0 ? "down" : ""}`}>{pct > 0 ? "▲" : pct < 0 ? "▼" : "•"} {Math.abs(pct)}% vs previous period</span>;
    }
  }
  return (
    <div className="adm-card kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">
        {value.toLocaleString()}
        {suffix}
      </span>
      {delta}
    </div>
  );
}

export function BarList({ items, empty = "No data yet.", format = (k: string) => k }: { items: { key: string; n: number }[]; empty?: string; format?: (k: string) => string }) {
  if (!items.length) return <p className="empty">{empty}</p>;
  const max = Math.max(...items.map((i) => i.n));
  return (
    <ul className="barlist">
      {items.map((i) => (
        <li key={i.key}>
          <i style={{ width: `${(i.n / max) * 100}%` }} />
          <span title={i.key}>{format(i.key)}</span>
          <span>{i.n.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

/** Bars for pageviews, a line for visitors, dots for chats. Pure SVG, no chart library. */
export function TrafficChart({ data, rangeMs }: { data: { t: number; pageviews: number; visitors: number; chats: number }[]; rangeMs: number }) {
  const W = 760,
    H = 180,
    pad = 22;
  const max = Math.max(1, ...data.map((d) => Math.max(d.pageviews, d.chats)));
  const bw = (W - pad * 2) / data.length;
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const label = (t: number) =>
    rangeMs <= 86_400_000
      ? new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" })
      : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kathmandu" });
  const line = data.map((d, i) => `${i ? "L" : "M"}${pad + i * bw + bw / 2} ${y(d.visitors)}`).join(" ");
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Traffic over time">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={y(max * f)} y2={y(max * f)} stroke="var(--line)" strokeDasharray="2 4" />
        ))}
        {data.map((d, i) => (
          <g key={i}>
            <rect x={pad + i * bw + 2} y={y(d.pageviews)} width={Math.max(2, bw - 4)} height={H - pad - y(d.pageviews)} rx={3} fill="#c7d2fe">
              <title>{`${label(d.t)} — ${d.pageviews} pageviews, ${d.visitors} visitors, ${d.chats} chats`}</title>
            </rect>
            {d.chats > 0 && <circle cx={pad + i * bw + bw / 2} cy={y(d.chats)} r={3} fill="#7c3aed" />}
          </g>
        ))}
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        <text x={pad} y={H - 4} fontSize="11" fill="var(--muted)">
          {data[0] ? label(data[0].t) : ""}
        </text>
        <text x={W - pad} y={H - 4} fontSize="11" fill="var(--muted)" textAnchor="end">
          now
        </text>
        <text x={pad} y={12} fontSize="11" fill="var(--muted)">
          {max}
        </text>
      </svg>
      <div className="chart-legend">
        <span>
          <i style={{ background: "#c7d2fe" }} />
          Pageviews
        </span>
        <span>
          <i style={{ background: "var(--accent)" }} />
          Visitors
        </span>
        <span>
          <i style={{ background: "#7c3aed", borderRadius: "50%" }} />
          Chats
        </span>
      </div>
    </>
  );
}

export const ago = (ts: number) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kathmandu" });
};

export const when = (ts: number) =>
  new Date(ts).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" });

export function Loading() {
  return <p className="empty">Loading…</p>;
}
