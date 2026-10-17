import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Manrope } from "next/font/google";
import { projects, site, person } from "@/content/profile";
import { JsonLd } from "@/components/site/JsonLd";
import "./rojgar.css";

/**
 * Hand-built case study for Rojgar AI. It wears the product's own look —
 * indigo, Manrope headings and DM Sans text — and shows the real screens,
 * because a hiring tool is easiest to understand by seeing it.
 */

const heading = Manrope({ subsets: ["latin"], variable: "--rjg-heading", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--rjg-body", display: "swap" });

const p = projects.find((x) => x.slug === "rojgar-ai")!;
const next = projects[(projects.indexOf(p) + 1) % projects.length];
const REPO = "https://github.com/devrahulbanjara/Rojgar-AI";
const IMG = "/work/rojgar-ai";

export const metadata: Metadata = {
  title: `${p.title} — ${p.tagline}`,
  description: p.summary,
  alternates: { canonical: `/work/${p.slug}` },
  openGraph: { type: "article", title: p.title, description: p.tagline, images: [`${IMG}/08-job-applicants.jpg`] },
};

/** A screenshot in a light browser frame. */
function Shot({ src, alt, w, h, caption, className = "" }: { src: string; alt: string; w: number; h: number; caption?: string; className?: string }) {
  return (
    <figure className={`rjg-shot ${className}`} data-reveal>
      <div className="rjg-frame">
        <div className="rjg-frame-bar" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot, exact pixels matter */}
        <img src={`${IMG}/${src}`} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function Feature({ kicker, title, children, shot, flip }: { kicker: string; title: string; children: React.ReactNode; shot: React.ReactNode; flip?: boolean }) {
  return (
    <section className={`rjg-feature ${flip ? "is-flip" : ""}`}>
      <div className="rjg-feature-text" data-reveal>
        <p className="rjg-kicker">{kicker}</p>
        <h2 className="rjg-h2">{title}</h2>
        {children}
      </div>
      <div className="rjg-feature-shot">{shot}</div>
    </section>
  );
}

const realities = [
  { t: "Most employers aren't tech companies", d: "Hotels, clinics, schools and shops, often with no website and no HR team." },
  { t: "Many good applicants have no CV", d: "Drivers, cooks and front-desk staff apply by phone, or through someone they know." },
  { t: "Hiring happens on Facebook and Viber", d: "A new job board isn't the answer. One link that works everywhere is." },
];

const steps = [
  { t: "Post a job", d: "Type one sentence. The AI writes the post; you edit anything." },
  { t: "Share one link", d: "LinkedIn, Facebook, Viber, Merojob, or a QR poster on the door." },
  { t: "People apply from a phone", d: "In a minute, in English or Nepali. No account." },
  { t: "Decide in one click", d: "Best fit first, with proof. Every applicant hears back." },
];

const pipeline = [
  { t: "Knockout answers", d: "Rules, no AI" },
  { t: "Shorten long CVs", d: "Local model, ~1,000 tokens" },
  { t: "Safety check", d: "Hidden instructions" },
  { t: "Quick review", d: "Small model" },
  { t: "Full review", d: "Only when it matters" },
  { t: "Checked in code", d: "Quotes verified, fit calculated" },
];

const guardrails = [
  { t: "Human in the loop", d: "The AI never moves an applicant, sends a message or changes a job. A person makes every decision, with an undo window." },
  { t: "Blind review", d: "Names, photos, contact details and school names are removed before the model reads anything." },
  { t: "Proof, verified", d: "Every quote must appear word for word in the CV, or that check counts as missing." },
  { t: "Prompt injection", d: "Text is cleaned, scanned for known phrases and checked by a classifier; flagged CVs go to a person." },
  { t: "Fair criteria", d: "Must-haves are checked against Nepal's Labour Act: no gender, caste, religion or age requirements." },
  { t: "Private files", d: "CVs are private and open only through short-lived signed links." },
];

const engineering = [
  { t: "LangChain agents", d: "Every AI call is an agent with structured output: the review, the injection check, Ask AI and a job writer with a salary-search tool." },
  { t: "Groq, then Gemini", d: "When Groq's free-tier limits run out, the call goes to Gemini at once. Both free tiers add up." },
  { t: "Quota guard", d: "Requests and tokens per minute and per day are counted in Redis. Models cool down exactly as long as the provider asks; reviews wait instead of failing." },
  { t: "Local multilingual AI", d: "multilingual-e5-small and BM25 power search by meaning and keep every prompt small, with no API cost." },
];

export default function RojgarAiPage() {
  return (
    <article className={`rjg ${heading.variable} ${body.variable}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: p.title,
          headline: p.tagline,
          description: p.summary,
          url: `${site.url}/work/${p.slug}`,
          codeRepository: REPO,
          programmingLanguage: ["Python", "TypeScript"],
          author: { "@id": `${site.url}/#person`, name: person.name },
          dateCreated: p.year,
          keywords: p.stack.join(", "),
        }}
      />

      {/* Hero */}
      <header className="rjg-hero rjg-wrap">
        <Link href="/work" className="rjg-back" data-reveal>
          ← All projects
        </Link>
        <div className="rjg-brand" data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
          <img src={`${IMG}/rojgar-ai-mark.svg`} alt="" width={44} height={44} />
          <span>Rojgar AI</span>
        </div>
        <h1 className="rjg-title" data-reveal>
          Share one link.
          <br />
          Meet the best applicants first.
        </h1>
        <p className="rjg-lede" data-reveal>
          {p.tagline}
        </p>
        <div className="rjg-cta" data-reveal>
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="rjg-btn" data-ev="cs_link" data-ev-slug={p.slug}>
            View the code on GitHub ↗
          </a>
          <a href={`${REPO}#how-ai-is-used`} target="_blank" rel="noopener noreferrer" className="rjg-btn is-ghost" data-ev="cs_link" data-ev-slug={p.slug}>
            How AI is used ↗
          </a>
        </div>
        <dl className="rjg-meta" data-reveal>
          <div>
            <dt>My role</dt>
            <dd>{p.role}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {p.status} · {p.year}
            </dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>{p.stack.slice(0, 6).join(", ")}</dd>
          </div>
        </dl>
        <Shot
          className="rjg-hero-shot"
          src="08-job-applicants.jpg"
          alt="A job's applicants, best fit first, with one applicant open: the reason, each must-have with a quote from the CV, and Shortlist or Reject buttons"
          w={1440}
          h={1000}
          caption="A job's applicants, best fit first. Open one to see each must-have checked against their CV, then shortlist or reject in one click."
        />
      </header>

      {/* The problem */}
      <section className="rjg-section rjg-wrap">
        <p className="rjg-kicker" data-reveal>
          The problem
        </p>
        <h2 className="rjg-h2 rjg-h2-wide" data-reveal>
          Hiring tools are built for tech companies. Nepal mostly isn&apos;t.
        </h2>
        <p className="rjg-wide" data-reveal>
          {p.problem}
        </p>
        <div className="rjg-grid-3">
          {realities.map((r, i) => (
            <div key={r.t} className="rjg-card" data-reveal style={{ ["--d" as string]: i }}>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rjg-section rjg-wrap">
        <p className="rjg-kicker" data-reveal>
          How it works
        </p>
        <h2 className="rjg-h2" data-reveal>
          Four steps. No account for applicants.
        </h2>
        <ol className="rjg-steps">
          {steps.map((s, i) => (
            <li key={s.t} data-reveal style={{ ["--d" as string]: i }}>
              <span className="rjg-step-num">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <div className="rjg-wrap rjg-features">
        <Feature
          kicker="Ask AI"
          title="Ask anything about an applicant."
          shot={<Shot src="09-ask-ai.jpg" alt="Ask AI answering a question about an applicant's monitoring experience, with suggested interview questions" w={1440} h={1000} />}
        >
          <p>
            &ldquo;Has she used React in production?&rdquo; &ldquo;What should I ask in the interview?&rdquo; The answer comes only from that person&apos;s CV, form answers, review and interview notes, with quotes checked against them. An answer without support becomes &ldquo;Not in their CV or notes.&rdquo;
          </p>
          <p className="rjg-muted">It can suggest an action, like shortlisting, but only you can press the button.</p>
        </Feature>

        <Feature
          flip
          kicker="Post a job with AI"
          title="One sentence in. A full job post out."
          shot={<Shot src="12-builder-ai.jpg" alt="The job builder filled in by AI from one sentence: title, category, salary, description and must-haves" w={1440} h={1450} className="is-tall" />}
        >
          <p>
            &ldquo;Staff nurse for our hospital in Pokhara, NNC registration, night shifts, NPR 35–45k.&rdquo; The agent fills in the title, category, salary, description and must-haves, and turns on &ldquo;CV required&rdquo; for a healthcare job. Ask what to pay and it searches the web and cites its sources.
          </p>
          <p className="rjg-muted">A salary number stays only if you wrote it or a cited source did.</p>
        </Feature>

        <Feature
          kicker="One link, every channel"
          title="Share it online, or print it."
          shot={
            <div className="rjg-pair">
              <Shot src="11-share-online.jpg" alt="Post online: the apply link and ready text for LinkedIn, Facebook and Merojob, with a QR code" w={1440} h={900} />
              <Shot src="04-poster.jpg" alt="A printable QR poster for a hotel receptionist job" w={1100} h={1020} />
            </div>
          }
        >
          <p>Every job gets one apply link, ready-made text for LinkedIn, Facebook and Merojob, and a QR poster for the shop door or a notice board. Staff can send personal &ldquo;suggest someone you know&rdquo; links, and each link counts its own applications.</p>
        </Feature>

        <Feature
          flip
          kicker="For applicants"
          title="Apply in a minute, from a phone."
          shot={
            <div className="rjg-phone-pair">
              <div className="rjg-phone" data-reveal>
                {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot */}
                <img src={`${IMG}/03-apply-mobile.jpg`} alt="A job's apply page on a phone" width={390} height={844} loading="lazy" />
              </div>
              <Shot src="16-my-applications.jpg" alt="An applicant's applications and their stages, with an interview to add to the calendar" w={1440} h={900} />
            </div>
          }
        >
          <ul className="rjg-ticks">
            <li>No account: name, phone and the job&apos;s questions.</li>
            <li>English or नेपाली, switched with one tap.</li>
            <li>A CV only when the job needs one; a photo of a paper CV works.</li>
            <li>A private status link, and a magic-link sign-in to see every application.</li>
            <li>Everyone hears back, even when they aren&apos;t selected.</li>
          </ul>
        </Feature>

        <Feature
          kicker="Interviews"
          title="Booked inside the platform."
          shot={<Shot src="13-interviews.jpg" alt="Interviews grouped by day, with Join, Reschedule and How did it go? buttons" w={1440} h={900} />}
        >
          <ol className="rjg-mini-steps">
            <li>Set your hours once: days, interview length, gaps, and the video link.</li>
            <li>Move an applicant to Interview; they get a private booking link.</li>
            <li>They pick a time you&apos;re free, at least 2 hours ahead, never overlapping.</li>
            <li>Both sides get a calendar invite with a Jitsi room (or your own Meet or Zoom).</li>
            <li>Reminders 24 hours and 1 hour before; reschedule or cancel from the link.</li>
            <li>Afterwards, &ldquo;How did it go?&rdquo; notes that Ask AI can quote.</li>
          </ol>
        </Feature>

        <Feature
          flip
          kicker="Every day"
          title="What needs you now, in one place."
          shot={
            <div className="rjg-pair">
              <Shot src="06-today.jpg" alt="Today: interviews today and each open job's applicants to review, call or decide" w={1440} h={960} />
              <Shot src="14-insights.jpg" alt="Insights: hiring progress, where applicants come from and how fast they hear back" w={1440} h={1250} />
            </div>
          }
        >
          <p>Today answers one question: what needs you now? Interviews today, and for each job who is waiting to be reviewed, called or decided. Insights show hiring progress, where applicants come from, and how fast everyone hears back.</p>
        </Feature>

        <Feature
          kicker="Teams and trust"
          title="Built for real businesses."
          shot={
            <div className="rjg-pair">
              <Shot src="15-team.jpg" alt="Team page with Owner and Manager roles and an invite link" w={1440} h={640} />
              <Shot src="17-admin.jpg" alt="Platform admin approvals for a new business" w={1440} h={420} />
            </div>
          }
        >
          <p>Owner, Manager and Interviewer roles, invite-only teams and an audit log. New businesses are verified before their jobs go public, and anyone can report a job that asks for money.</p>
        </Feature>
      </div>

      {/* The AI */}
      <section className="rjg-dark">
        <div className="rjg-wrap">
          <p className="rjg-kicker is-light" data-reveal>
            How the AI works
          </p>
          <h2 className="rjg-h2 rjg-h2-wide" data-reveal>
            AI assists. <span className="rjg-grad">You decide.</span>
          </h2>
          <p className="rjg-wide is-light" data-reveal>
            Human in the loop by design. Each application is reviewed shortly after it arrives, and every step is built so the AI&apos;s answer is evidence a person can check, never a decision.
          </p>
          <ol className="rjg-pipeline" data-reveal>
            {pipeline.map((s, i) => (
              <li key={s.t}>
                <span className="rjg-pipe-num">{i + 1}</span>
                <strong>{s.t}</strong>
                <span>{s.d}</span>
              </li>
            ))}
          </ol>
          <div className="rjg-grid-3">
            {guardrails.map((g, i) => (
              <div key={g.t} className="rjg-card is-dark" data-reveal style={{ ["--d" as string]: i % 3 }}>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering */}
      <section className="rjg-section rjg-wrap">
        <p className="rjg-kicker" data-reveal>
          Under the hood
        </p>
        <h2 className="rjg-h2" data-reveal>
          Built to run well on free AI tiers.
        </h2>
        <div className="rjg-grid-2">
          {engineering.map((e, i) => (
            <div key={e.t} className="rjg-card" data-reveal style={{ ["--d" as string]: i % 2 }}>
              <h3>{e.t}</h3>
              <p>{e.d}</p>
            </div>
          ))}
        </div>
        <h3 className="rjg-h3" data-reveal>
          What I built
        </h3>
        <ol className="rjg-built" data-reveal>
          {p.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
        <div className="rjg-stack" data-reveal>
          {["FastAPI", "async SQLAlchemy", "PostgreSQL", "Alembic", "Redis", "Qdrant", "LangChain", "Groq", "Gemini", "fastembed", "Cloudinary", "Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui", "RTK Query", "pytest", "GitHub Actions", "Docker"].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </section>

      {/* Decisions, lessons, limits */}
      <section className="rjg-section rjg-wrap">
        <p className="rjg-kicker" data-reveal>
          Key decisions
        </p>
        <div className="rjg-grid-2">
          {p.decisions?.map((d, i) => (
            <div key={d.title} className="rjg-card" data-reveal style={{ ["--d" as string]: i % 2 }}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </div>
          ))}
        </div>
        <div className="rjg-split">
          <div data-reveal>
            <p className="rjg-kicker">What I learned</p>
            {p.lessons?.map((l) => (
              <p key={l} className="rjg-lesson">
                {l}
              </p>
            ))}
          </div>
          <div data-reveal>
            <p className="rjg-kicker">What&apos;s next</p>
            <ul className="rjg-ticks is-plain">
              {p.limitations?.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rjg-wrap">
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="rjg-repo" data-reveal data-ev="cs_link" data-ev-slug={p.slug}>
          <span className="rjg-repo-label">Code, architecture and how AI is used</span>
          <strong>github.com/devrahulbanjara/Rojgar-AI ↗</strong>
          <span className="rjg-repo-sub">README with a screenshot tour · AGENTS.md · 340 backend tests</span>
        </a>
      </section>

      <Link href={`/work/${next.slug}`} className="cs-next wrap" data-ev="cs_next">
        <span className="label">Next project</span>
        <strong>{next.title}</strong>
        <span className="sub">{next.tagline}</span>
      </Link>
    </article>
  );
}
