import "server-only";
import {
  person,
  experience,
  projects,
  certifications,
  teaching,
  services,
  workProcess,
  faqs,
  skills,
  testimonials,
  education,
  community,
  uses,
} from "@/content/profile";
import { getPublishedPosts } from "@/lib/posts";

/**
 * The agent's world is a small virtual filesystem compiled from content/profile.ts
 * and published blog posts. Tools read these "files"; the UI shows which ones
 * were read, so every answer is traceable to its source.
 */
export type KFile = { path: string; title: string; description: string; body: string };

const fmtDate = (ym: string | null) => (ym ? new Date(`${ym}-01`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

export async function buildKnowledge(): Promise<KFile[]> {
  const files: KFile[] = [];

  files.push({
    path: "about.md",
    title: "About Rahul",
    description: "Bio, positioning, location, languages, headline stats",
    body: [
      `# ${person.name} (${person.nameDevanagari})`,
      `${person.role} & ${person.secondaryRole} · ${person.location} (timezone ${person.timezone})`,
      person.headline,
      person.intro,
      ...person.about,
      `Stats: ${person.stats.map((s) => `${s.value} ${s.label}`).join("; ")}`,
      `Languages: ${person.languages.join(", ")}`,
    ].join("\n\n"),
  });

  files.push({
    path: "contact.md",
    title: "Availability & contact",
    description: "Whether Rahul is available for hire, how to reach him, socials",
    body: [
      `Availability: ${person.availability.open ? "Rahul is open to new work" : "Rahul is not currently taking new work"} — ${person.availability.label}. ${person.availability.detail}.`,
      `Email: ${person.email}`,
      "Contact form: /contact",
      ...person.socials.map((s) => `${s.label}: ${s.url}`),
      "Résumé: /resume",
    ].join("\n"),
  });

  for (const e of experience) {
    files.push({
      path: `experience/${e.id}.md`,
      title: `${e.role} at ${e.company}`,
      description: `${e.role}, ${e.company}, ${fmtDate(e.start)}–${fmtDate(e.end)}`,
      body: [
        `# ${e.role} — ${e.company}`,
        `${e.end ? "Past role (ended)" : "Current role"} · ${e.type} · ${e.location} · ${fmtDate(e.start)} – ${fmtDate(e.end)}`,
        e.summary,
        ...e.highlights.map((h) => `- ${h}`),
        `Stack: ${e.stack.join(", ")}`,
      ].join("\n"),
    });
  }

  for (const p of projects) {
    files.push({
      path: `projects/${p.slug}.md`,
      title: `${p.title} — ${p.tagline}`,
      description: `${p.category} project (${p.year}, ${p.status})`,
      body: [
        `# ${p.title} (${p.year}) — ${p.status}`,
        `Role: ${p.role}. Page: /work/${p.slug}`,
        p.tagline,
        p.summary,
        `Problem: ${p.problem}`,
        `Approach:\n${p.approach.map((a) => `- ${a}`).join("\n")}`,
        `Architecture:\n${p.architecture.map((a) => `- ${a}`).join("\n")}`,
        `Key decisions:\n${p.decisions.map((d) => `- ${d.title}: ${d.body}`).join("\n")}`,
        `Results:\n${p.results.map((r) => `- ${r.metric}: ${r.value}${r.note ? ` (${r.note})` : ""}`).join("\n")}`,
        `Lessons: ${p.lessons.join(" ")}`,
        `Stack: ${p.stack.join(", ")}`,
      ].join("\n\n"),
    });
  }

  files.push({
    path: "education.md",
    title: "Education & community",
    description: "Degree, college and community leadership",
    body: [
      ...education.map((e) => `- ${e.degree}, ${e.school} (${e.start}–${e.end})`),
      ...community.map((c) => `- ${c.role}, ${c.name} (${c.start}–${c.end})`),
    ].join("\n"),
  });

  files.push({
    path: "certifications.md",
    title: "Certifications",
    description: "Professional certifications with dates",
    body: certifications
      .map((c) => `- ${c.name} (${c.code}), ${c.issuer}. Issued ${fmtDate(c.issued)}${c.expires ? `, valid until ${fmtDate(c.expires)}` : ""}. Skills: ${c.skills.join(", ")}.`)
      .join("\n"),
  });

  files.push({
    path: "teaching.md",
    title: "Teaching & training",
    description: "Courses Rahul teaches (Python, Data Science, ML/AI on AWS), philosophy, talks",
    body: [
      "# Teaching",
      `Stats: ${teaching.stats.map((s) => `${s.value} ${s.label}`).join("; ")}`,
      `Philosophy:\n${teaching.philosophy.map((p) => `- ${p}`).join("\n")}`,
      ...teaching.courses.map(
        (c) => `## ${c.title}\nAudience: ${c.audience}. Format: ${c.format}. ${c.learners ? `Learners: ${c.learners}.` : ""}\n${c.description}\nTopics: ${c.topics.join(", ")}.\nOutcome: ${c.outcome}`,
      ),
      teaching.talks.length ? `Talks:\n${teaching.talks.map((t) => `- "${t.title}" — ${t.event}, ${fmtDate(t.date)}`).join("\n")}` : "",
    ].join("\n\n"),
  });

  files.push({
    path: "services.md",
    title: "Services — how to work with Rahul",
    description: "What clients and companies can hire Rahul for, engagement models, process, FAQ",
    body: [
      ...services.map((s) => `## ${s.title}\nFor: ${s.for}. ${s.pitch}\nDeliverables: ${s.deliverables.join("; ")}.\nEngagement: ${s.engagement}. ${s.outcome}`),
      `Process: ${workProcess.map((p) => `${p.step} ${p.title} — ${p.body}`).join(" ")}`,
      `FAQ:\n${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`,
    ].join("\n\n"),
  });

  files.push({
    path: "skills.md",
    title: "Skills & stack",
    description: "Technical skills grouped by area, plus tools he uses daily",
    body: [
      ...skills.map((s) => `${s.group}: ${s.items.join(", ")}`),
      ...uses.map((u) => `${u.group}: ${u.items.map((i) => `${i.name} (${i.note})`).join("; ")}`),
    ].join("\n"),
  });

  files.push({
    path: "testimonials.md",
    title: "What people say",
    description: "Testimonials from colleagues and students",
    body: testimonials.length ? testimonials.map((t) => `"${t.quote}" — ${t.name}, ${t.title}`).join("\n") : "No testimonials published yet.",
  });

  const posts = await getPublishedPosts();
  files.push({
    path: "blog/index.md",
    title: "Blog posts",
    description: `${posts.length} published articles by Rahul`,
    body: posts.length
      ? posts.map((p) => `- "${p.title}" (/blog/${p.slug}) — ${p.excerpt} [tags: ${p.tags.join(", ")}]`).join("\n")
      : "No posts published yet.",
  });

  return files;
}

/* ── tiny BM25 over the virtual files ─────────────────────────────── */

const STOP = new Set("a an and are as at be by does did do for from has have he him his how i in is it its me my of on or rahul rahul's s so tell that the their them this to was what when where which who why with you your about".split(" "));
/** Light stemming so "agents"/"agent", "teaching"/"teach", "built"/"build" match. */
const IRREGULAR: Record<string, string> = { built: "build", taught: "teach", ran: "run", wrote: "write", written: "write" };
const stem = (t: string) => {
  if (IRREGULAR[t]) return IRREGULAR[t];
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 4 && t.endsWith("es") && /(ch|sh|x|ss)es$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  if (t.length > 4 && t.endsWith("ed")) return t.slice(0, -2);
  return t;
};
const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);

export function searchKnowledge(files: KFile[], query: string, k = 3) {
  // Chunk files by paragraph so results point at the relevant passage.
  const chunks = files.flatMap((f) =>
    f.body
      .split(/\n{2,}/)
      .filter((c) => c.trim().length > 20)
      .map((text) => ({ path: f.path, text, toks: tokenize(`${f.title} ${text}`) })),
  );
  const q = tokenize(query);
  if (!q.length || !chunks.length) return [];
  const N = chunks.length;
  const avg = chunks.reduce((s, c) => s + c.toks.length, 0) / N;
  const df = new Map<string, number>();
  for (const c of chunks) for (const t of new Set(c.toks)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.4,
    b = 0.75;
  return chunks
    .map((c) => {
      let score = 0;
      for (const t of q) {
        const tf = c.toks.filter((x) => x === t || (t.length > 4 && x.startsWith(t))).length;
        if (!tf) continue;
        const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * c.toks.length) / avg)));
      }
      return { path: c.path, text: c.text.slice(0, 450), score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
