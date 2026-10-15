import type { Metadata } from "next";
import Link from "next/link";
import { JetBrains_Mono } from "next/font/google";
import { projects, site, person } from "@/content/profile";
import { JsonLd } from "@/components/site/JsonLd";
import "./omarchy.css";

/**
 * Hand-built case study for Omarchy OCR. Unlike the shared template, it borrows
 * Omarchy's own look — Tokyo Night colours, a monospace face, Waybar up top and
 * every section as a tiled Hyprland window — because the project lives there.
 */

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--omx-mono", display: "swap" });

const p = projects.find((x) => x.slug === "omarchy-ocr")!;
const next = projects[(projects.indexOf(p) + 1) % projects.length];
const REPO = "https://github.com/devrahulbanjara/omarchy-ppocr";

export const metadata: Metadata = {
  title: `${p.title} — ${p.tagline}`,
  description: p.summary,
  alternates: { canonical: `/work/${p.slug}` },
  openGraph: { type: "article", title: p.title, description: p.tagline },
};

// Real outputs from the 100-image benchmark (bench/results/*), same screenshot for both engines.
const failures = [
  { label: "10 px text", ours: "Optical character recognition turns pixels back into text you can edit.", theirs: "Opal characte recogni pees Back no txt you can edt." },
  { label: "SQL", ours: "WHERE u.created_at >= '2024-01-01'", theirs: "WHERE v.created_at >= '2024-81-01\"" },
  { label: "Python", ours: "def __init__(self):", theirs: "def __init_ (self):" },
  { label: "German", ours: "Die Größe der Datei überschreitet das zulässige Maximum.", theirs: "Die GroBe der Datei lberschreitet das zulassige Maximum." },
  { label: "File-manager buttons", ours: "Downloads  Documents / Pictures  Music / Videos  Trash", theirs: "(empty — nothing copied)" },
];

const dataset = [
  ["terminal", "10", "ls, git log, pacman, docker, ping, Rust and Python errors"],
  ["code", "10", "Python, JS, Rust, Go, SQL, Bash, JSON, Lua — indentation matters"],
  ["ui", "10", "menus, settings panels, button grids, nav bars"],
  ["identifiers", "10", "URLs, emails, UUIDs, commit hashes, IPs, file paths, keys"],
  ["mixed styles", "12", "headings, italics, bold, 13–30 px in one capture"],
  ["prose", "8", "plain paragraphs in sans and serif faces"],
  ["small text", "8", "9–11 px, where OCR usually breaks"],
  ["low contrast", "8", "muted theme colours — placeholders, secondary text"],
  ["tables", "8", "aligned columns of names, prices, versions"],
  ["numbers", "8", "invoices, IBANs, phone numbers, dates, tracking codes"],
  ["accented", "8", "French, German, Spanish, Portuguese, Danish"],
];

const CAP = 7; // % — chart scale; larger values are drawn as capped
const categoryCer = [
  ["ui", "22.7%", "0.0%"],
  ["accented", "6.9%", "0.5%"],
  ["small text", "2.9%", "0.0%"],
  ["identifiers", "2.9%", "0.5%"],
  ["code", "2.8%", "0.7%"],
  ["mixed styles", "2.5%", "0.0%"],
  ["terminal", "2.3%", "2.3%"],
  ["tables", "1.5%", "0.4%"],
  ["numbers", "0.3%", "0.9%"],
];

function Win({ title, children, className = "", accent }: { title: string; children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <section className={`omx-win ${accent ? "is-focus" : ""} ${className}`} data-reveal>
      <header className="omx-win-bar">
        <span className="omx-win-title">{title}</span>
        <span className="omx-win-dots" aria-hidden>
          <i /> <i /> <i />
        </span>
      </header>
      <div className="omx-win-body">{children}</div>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="omx-kbd">{children}</kbd>;
}

export default function OmarchyOcrPage() {
  return (
    <article className={`omx ${mono.variable}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: p.title,
          headline: p.tagline,
          description: p.summary,
          url: `${site.url}/work/${p.slug}`,
          codeRepository: REPO,
          programmingLanguage: ["Python", "QML", "Bash"],
          author: { "@id": `${site.url}/#person`, name: person.name },
          dateCreated: p.year,
          keywords: p.stack.join(", "),
        }}
      />

      {/* Waybar */}
      <div className="omx-bar" aria-hidden>
        <span className="omx-ws">
          {[1, 2, 3, 4, 5].map((n) => (
            <b key={n} className={n === 2 ? "is-on" : ""}>
              {n}
            </b>
          ))}
        </span>
        <span className="omx-bar-mid">omarchy-ocr — case study</span>
        <span className="omx-bar-right">
          <span>cpu only</span>
          <span>offline</span>
          <span className="omx-ok">● 0.7s</span>
        </span>
      </div>

      <div className="omx-desk">
        {/* Hero */}
        <Win title="~/work/omarchy-ocr" accent className="omx-hero">
          <Link href="/work" className="omx-back">
            ← cd ../projects
          </Link>
          <p className="omx-prompt">
            <span className="omx-path">~</span> <span className="omx-caret">❯</span> cat README.md
          </p>
          <h1 className="omx-title">{p.title}</h1>
          <p className="omx-lede">
            Better screen OCR for <a href="https://omarchy.org" target="_blank" rel="noopener noreferrer">Omarchy</a>: press <Kbd>Super</Kbd> + <Kbd>Ctrl</Kbd> + <Kbd>Print</Kbd>, drag a box over anything on screen, and the text lands on your clipboard — now with{" "}
            <em>7× fewer wrong characters</em>, on a laptop CPU, fully offline.
          </p>
          <dl className="omx-meta">
            <div>
              <dt>role</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>status</dt>
              <dd>
                {p.status} · {p.year}
              </dd>
            </div>
            <div>
              <dt>install</dt>
              <dd>
                <code>omarchy plugin add {REPO.replace("https://", "")}</code>
              </dd>
            </div>
            <div>
              <dt>links</dt>
              <dd className="omx-links">
                {p.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" data-ev="cs_link" data-ev-slug={p.slug}>
                    {l.label} ↗
                  </a>
                ))}
                <a href="https://omarchy.org" target="_blank" rel="noopener noreferrer">
                  omarchy.org ↗
                </a>
              </dd>
            </div>
          </dl>
        </Win>

        <Win title="btop — results" className="omx-stats-win">
          <div className="omx-stats">
            {p.results.map((r) => (
              <div key={r.metric} className="omx-stat">
                <strong>{r.value}</strong>
                <span>
                  {r.metric}
                  {r.note ? <small> ({r.note})</small> : null}
                </span>
              </div>
            ))}
          </div>
        </Win>

        {/* What is Omarchy */}
        <div className="omx-tile-2">
          <Win title="man omarchy">
            <h2 className="omx-h">What is Omarchy?</h2>
            <p>
              <a href="https://omarchy.org" target="_blank" rel="noopener noreferrer">Omarchy</a> is an opinionated Linux setup created by David Heinemeier Hansson (DHH): Arch Linux with the{" "}
              <a href="https://hypr.land" target="_blank" rel="noopener noreferrer">Hyprland</a> tiling window manager, preconfigured into a fast, keyboard-driven desktop with beautiful themes. Windows tile next to each other instead of overlapping, and almost everything is a keystroke away.
            </p>
            <p>
              One of those keystrokes is <Kbd>Super</Kbd> + <Kbd>Ctrl</Kbd> + <Kbd>Print</Kbd>: <strong>Extract text (OCR)</strong>. The screen freezes, you select a region, and whatever text is inside it — an error message, a URL in a video, a table in a PDF — is copied to the clipboard. It&apos;s the kind of tool you reach for many times a day, so every wrong character costs you.
            </p>
          </Win>
          <Win title="cat /usr/bin/omarchy-capture-text">
            <h2 className="omx-h">What it shipped with</h2>
            <p>Under the hood, the default is a short shell script around Tesseract — the classic open-source OCR engine:</p>
            <pre className="omx-code">
              <span className="omx-dim"># the exact default command</span>
              {"\n"}grim -g &quot;$SELECTION&quot; - | tesseract stdin stdout \{"\n"}  --oem 1 --psm 6 -l eng --dpi 300
            </pre>
            <p>
              Tesseract was designed for scanned paper: black text, white page, 300 DPI. Screens are different — tiny anti-aliased fonts, coloured themes, UI labels scattered across a row, code full of symbols. And Omarchy ships only the English model.
            </p>
          </Win>
        </div>

        {/* The problem */}
        <Win title="journalctl -p err — what kept going wrong">
          <h2 className="omx-h">The problem with the default</h2>
          <p className="omx-wide">
            The failures are quiet. Nothing tells you OCR got it wrong — you paste a command, a hash or a price and find out later that one character was off. These are real outputs from the benchmark, same screenshot, both engines:
          </p>
          <figure className="omx-shot">
            {/* eslint-disable-next-line @next/next/no-img-element -- static sample, exact pixels matter */}
            <img src="/work/omarchy-ocr/small-text.png" alt="Five lines of 10 px grey text on white, one of the benchmark screenshots" loading="lazy" />
            <figcaption>One benchmark screenshot: 10 px text at 1× scale.</figcaption>
          </figure>
          <div className="omx-diff" role="table" aria-label="Default OCR versus Omarchy OCR on the same screenshots">
            <div className="omx-diff-head" role="row">
              <span role="columnheader">case</span>
              <span role="columnheader">default (Tesseract)</span>
              <span role="columnheader">Omarchy OCR</span>
            </div>
            {failures.map((f) => (
              <div key={f.label} className="omx-diff-row" role="row">
                <span role="cell" className="omx-dim">
                  {f.label}
                </span>
                <code role="cell" className="omx-bad">
                  {f.theirs}
                </code>
                <code role="cell" className="omx-good">
                  {f.ours}
                </code>
              </div>
            ))}
          </div>
          <p className="omx-wide">
            So the goal was clear: much more accurate on screen text, but still <strong>offline</strong>, still on an <strong>ordinary laptop with no GPU</strong>, and still the same one keystroke.
          </p>
        </Win>

        {/* What I built + how it works */}
        <div className="omx-tile-2">
          <Win title="git log --oneline — what I built">
            <h2 className="omx-h">What I did</h2>
            <ol className="omx-steps">
              {p.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </Win>
          <Win title="tree — how a capture flows">
            <h2 className="omx-h">How it works</h2>
            <pre className="omx-code omx-tree">{`Super+Ctrl+Print
├─ hyprpicker   freeze the screen
├─ slurp        select a region
├─ grim         capture at native resolution
├─ omarchy-ppocr-extract
│  ├─ warm server? → answer in ≈0.7 s
│  │  else run once, start server for next time
│  ├─ PP-OCRv6 detect   (9.5 MB ONNX)
│  ├─ PP-OCRv6 read     (21 MB, multilingual)
│  └─ rebuild lines, indentation, paragraphs
└─ wl-copy + notification`}</pre>
            <p>
              Same flow as the original, different engine. If the new engine is ever missing, it falls back to the exact Tesseract command, so the shortcut never breaks.
            </p>
          </Win>
        </div>

        {/* Dataset */}
        <Win title="ls bench/dataset — 100 screenshots">
          <h2 className="omx-h">The dataset I evaluated on</h2>
          <p className="omx-wide">
            Real-world OCR benchmarks are scanned documents and street signs — nothing like a desktop. And hand-typed answers for screenshots carry the typist&apos;s own mistakes. So I <strong>generated</strong> a golden set where the right answer is known exactly: each sample is an HTML page rendered by headless Chromium with the real system fonts (JetBrains Mono, DejaVu, Liberation, Noto, Adwaita…), in Omarchy&apos;s own theme colours (Tokyo Night, Catppuccin, Gruvbox, Nord, Everforest, Matte Black and light themes), at display scales of 1×, 1.25×, 1.5× and 2×, then cropped like a real selection. Because I rendered the text, the ground truth is exact.
          </p>
          <div className="omx-samples">
            {[
              ["001_terminal.png", "terminal · Nord"],
              ["057_table.png", "table · Tokyo Night"],
              ["035_ui.png", "ui · light theme"],
            ].map(([f, c]) => (
              <figure key={f}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static sample */}
                <img src={`/work/omarchy-ocr/${f}`} alt={`Benchmark sample: ${c}`} loading="lazy" />
                <figcaption>{c}</figcaption>
              </figure>
            ))}
          </div>
          <div className="omx-table-wrap">
            <table className="omx-table">
              <thead>
                <tr>
                  <th scope="col">category</th>
                  <th scope="col">images</th>
                  <th scope="col">what it tests</th>
                </tr>
              </thead>
              <tbody>
                {dataset.map(([c, n, w]) => (
                  <tr key={c}>
                    <th scope="row">{c}</th>
                    <td>{n}</td>
                    <td className="omx-dim">{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Win>

        {/* Evaluation */}
        <div className="omx-tile-2">
          <Win title="bench.py — how I measured">
            <h2 className="omx-h">How I evaluated it</h2>
            <ol className="omx-steps">
              {(p.evaluation ?? []).slice(2).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ol>
          </Win>
          <Win title="metrics.py — what each number means">
            <h2 className="omx-h">The metrics</h2>
            <dl className="omx-defs">
              <div>
                <dt>CER / WER</dt>
                <dd>Share of characters / words wrong, by edit distance against the exact text.</dd>
              </div>
              <div>
                <dt>critical tokens</dt>
                <dd>URLs, hashes, prices, paths reproduced exactly — one wrong character and the paste is useless.</dd>
              </div>
              <div>
                <dt>perfect images</dt>
                <dd>Captures with zero errors: paste and move on.</dd>
              </div>
              <div>
                <dt>blind LLM judge</dt>
                <dd>Each of the 200 outputs scored 1–5 for how usable it is when pasted, without knowing which engine wrote it.</dd>
              </div>
              <div>
                <dt>latency / memory</dt>
                <dd>End to end, through the same command the keypress runs.</dd>
              </div>
            </dl>
          </Win>
        </div>

        {/* Results */}
        {p.comparison && (
          <Win title="cat RESULTS.md" accent>
            <h2 className="omx-h">How much better</h2>
            <div className="omx-table-wrap">
              <table className="omx-table omx-compare">
                <thead>
                  <tr>
                    {p.comparison.columns.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.comparison.rows.map(([label, ...cells]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {cells.map((c, j) => (
                        <td key={j} className={(j === 0) === !!p.comparison!.defaultWins?.includes(label) ? "is-better" : undefined}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.comparison.note && <p className="omx-note">❯ {p.comparison.note}</p>}

            <h3 className="omx-h3">Character error rate by kind of screenshot</h3>
            <div className="omx-legend">
              <span className="omx-legend-rule">↓ lower is better</span>
              <span>
                <i className="omx-swatch omx-swatch-t" /> Omarchy default (Tesseract)
              </span>
              <span>
                <i className="omx-swatch omx-swatch-o" /> Omarchy OCR
              </span>
              <span className="omx-dim">winner in each row shown in green</span>
            </div>
            <div className="omx-bars">
              {categoryCer.map(([c, t, o]) => {
                const tv = parseFloat(t);
                const ov = parseFloat(o);
                const win = tv === ov ? "tie" : ov < tv ? "ours" : "theirs";
                return (
                  <div key={c} className="omx-bars-row">
                    <span className="omx-dim">{c}</span>
                    <span className="omx-bars-track">
                      <i className={`omx-bars-t ${tv > CAP ? "is-capped" : ""}`} style={{ width: `${Math.min(100, (tv / CAP) * 100)}%` }} />
                      <i className="omx-bars-o" style={{ width: `${Math.min(100, (ov / CAP) * 100)}%` }} />
                    </span>
                    <span className="omx-bars-val">
                      <span className={win === "theirs" ? "omx-good" : ""}>{t}</span>
                      <span className="omx-dim"> → </span>
                      <span className={win === "ours" ? "omx-good" : ""}>{o}</span>
                      {win === "tie" && <span className="omx-dim"> tie</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="omx-note">
              ❯ The scale stops at {CAP}% so small values stay visible; the UI bar runs off it (Tesseract: 22.7%, empty output on two of those screenshots). The new engine wins 7 of 9 kinds; terminal output is a tie and Tesseract wins on numbers.
            </p>
          </Win>
        )}

        {/* Decisions + limitations */}
        <div className="omx-tile-2">
          <Win title="decisions.md">
            <h2 className="omx-h">Key decisions</h2>
            <div className="omx-decisions">
              {p.decisions?.map((d) => (
                <div key={d.title}>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
              ))}
            </div>
          </Win>
          <Win title="KNOWN_ISSUES">
            <h2 className="omx-h">Limitations</h2>
            <ul className="omx-limits">
              {p.limitations?.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Win>
        </div>

        <Win title="what-i-learned.txt">
          <h2 className="omx-h">What I learned</h2>
          {p.lessons?.map((l) => (
            <p key={l} className="omx-wide">
              {l}
            </p>
          ))}
          <p className="omx-prompt omx-cta">
            <span className="omx-path">~</span> <span className="omx-caret">❯</span>{" "}
            <a href={REPO} target="_blank" rel="noopener noreferrer">
              git clone {REPO.replace("https://", "")}
            </a>
            <span className="omx-cursor" aria-hidden />
          </p>
        </Win>
      </div>

      <Link href={`/work/${next.slug}`} className="cs-next wrap omx-next" data-ev="cs_next">
        <span className="label">Next project</span>
        <strong>{next.title}</strong>
        <span className="sub">{next.tagline}</span>
      </Link>
    </article>
  );
}
