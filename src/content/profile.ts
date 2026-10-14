/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE SINGLE SOURCE OF TRUTH ABOUT RAHUL.
 *  Every page, the résumé, /llms.txt, resume.json AND the AI agent's knowledge
 *  base are generated from this file. Edit facts here and everything follows.
 *
 *  Real data (from rahuldevbanjara.com.np), except `projects`, which are
 *  still placeholders until the real ones are added.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  name: "Rahul Dev Banjara",
  shortName: "Rahul",
  title: "Rahul Dev Banjara — AI/ML Engineer & AWS ML Trainer",
  description:
    "Rahul Dev Banjara is an AI/ML engineer in Kathmandu who builds AI systems end to end — agents, retrieval and ML on AWS — and teaches the AWS Machine Learning Engineer certification.",
  locale: "en_US",
} as const;

export const person = {
  name: "Rahul Dev Banjara",
  nameDevanagari: "राहुल देव बन्जारा",
  role: "AI/ML Engineer",
  secondaryRole: "AWS ML Trainer",
  location: "Kathmandu, Nepal",
  timezone: "Asia/Kathmandu",
  email: "rdbanjara07@gmail.com",
  availability: {
    open: true,
    label: "Open to AI/ML engineering roles and projects",
    detail: "Based in Kathmandu (UTC+5:45), happy to work remotely",
  },
  headline: "I build AI systems end to end, and teach the engineers who ship them.",
  intro:
    "I'm an AI/ML engineer in Kathmandu. I build AI systems end to end — from the data and the models to the APIs and the products people use every day.",
  about: [
    "I work as an AI/ML engineer at Adex International, and I teach the AWS Machine Learning Engineer certification at TekBay Academy. Before that, I was an AI Fellow at Fusemachines.",
    "I graduated with a B.(Hons) in Computer Science from Herald College Kathmandu, and I lead the DevCorps AI Learners Community, where people help each other learn AI.",
    "I care about building things that work outside a demo, and about explaining them simply. Teaching keeps me honest on both.",
  ],
  socials: [
    { label: "GitHub", handle: "devrahulbanjara", url: "https://github.com/devrahulbanjara" },
    { label: "LinkedIn", handle: "in/devrahulbanjara", url: "https://linkedin.com/in/devrahulbanjara" },
    { label: "Hugging Face", handle: "devrahulbanjara", url: "https://huggingface.co/devrahulbanjara" },
    { label: "Email", handle: "rdbanjara07@gmail.com", url: "mailto:rdbanjara07@gmail.com" },
  ],
  stats: [
    { value: "2 yrs", label: "building AI and ML" },
    { value: "3", label: "certifications (AWS, NVIDIA, Fusemachines)" },
    { value: "AWS", label: "ML Engineer trainer at TekBay Academy" },
    { value: "BSc (Hons)", label: "Computer Science, Herald College Kathmandu" },
  ],
  languages: ["English", "Nepali", "Hindi"],
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  type: string;
  location: string;
  start: string; // YYYY-MM
  end: string | null;
  summary: string;
  highlights: string[];
  stack: string[];
  url?: string;
};

export const experience: Experience[] = [
  {
    id: "adex",
    company: "Adex International",
    role: "AI/ML Engineer",
    type: "Full-time",
    location: "Kathmandu, Nepal",
    start: "2025-06",
    end: null,
    summary: "Building AI systems end to end for client products.",
    highlights: [
      "Built a churn-prevention platform that an enterprise client uses daily.",
      "Built a clinical retrieval system reviewed by practising physicians.",
      "Built document-processing pipelines designed for messy, real-world input.",
    ],
    stack: ["Python", "FastAPI", "LLMs", "RAG", "AWS"],
  },
  {
    id: "tekbay",
    company: "TekBay Academy",
    role: "AWS Machine Learning Trainer",
    type: "Part-time",
    location: "Kathmandu, Nepal",
    start: "2025-06",
    end: null,
    summary: "Teaching the AWS Certified Machine Learning Engineer – Associate course.",
    highlights: ["Teach the AWS Machine Learning Engineer certification with hands-on SageMaker labs and exam practice."],
    stack: ["AWS SageMaker", "MLOps", "Teaching"],
  },
  {
    id: "fusemachines",
    company: "Fusemachines",
    role: "AI Fellow",
    type: "Fellowship",
    location: "Kathmandu, Nepal",
    start: "2024-03",
    end: "2024-10",
    summary: "AI Fellowship programme, completing the Fusemachines Microdegree™ in Artificial Intelligence.",
    highlights: ["Completed the Microdegree™ in Artificial Intelligence."],
    stack: ["Machine learning", "Deep learning", "Python"],
  },
];

export type Education = { id: string; school: string; degree: string; start: string; end: string };

export const education: Education[] = [
  { id: "herald", school: "Herald College Kathmandu", degree: "B.(Hons) in Computer Science", start: "2023", end: "2026" },
];

export const community = [
  { id: "devcorps", name: "DevCorps AI Learners Community", role: "Leader", start: "2024", end: "2026" },
];

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  code: string;
  issued: string;
  expires?: string;
  credentialUrl: string;
  skills: string[];
};

export const certifications: Certification[] = [
  {
    id: "aws-mla",
    name: "AWS Certified Machine Learning – Associate",
    issuer: "Amazon Web Services",
    code: "AWS MLA",
    issued: "2025-01",
    credentialUrl: "https://cp.certmetrics.com/amazon/en/public/verify/credential/035ddb7ca35541e0a815a122d7afcb84",
    skills: ["SageMaker", "MLOps", "Model deployment", "Monitoring"],
  },
  {
    id: "nvidia-genai",
    name: "NVIDIA-Certified Associate: Generative AI LLMs",
    issuer: "NVIDIA",
    code: "NCA-GENL",
    issued: "2026-01",
    credentialUrl: "https://www.credly.com/badges/e8836994-77e6-4762-835b-17ae8a79adda/linked_in_profile",
    skills: ["LLMs", "Generative AI", "Prompting", "Fine-tuning"],
  },
  {
    id: "fuse-microdegree",
    name: "Microdegree™ in Artificial Intelligence",
    issuer: "Fusemachines",
    code: "Microdegree",
    issued: "2024-10",
    credentialUrl: "https://s3.amazonaws.com/fuseclassroom-resources-prod/student-certificates/Microdegree%E2%84%A2+in+Artificial+Intelligence-RAHUL+DEV+BANJARA.pdf",
    skills: ["Machine learning", "Deep learning"],
  },
];

export type Project = {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  year: string;
  role: string;
  status: "Production" | "Live" | "Open source" | "Research" | "In progress";
  category: "Agents" | "Retrieval" | "MLOps" | "Education" | "Tools";
  summary: string;
  problem: string;
  approach: string[];
  architecture: string[];
  decisions: { title: string; body: string }[];
  results: { metric: string; value: string; note?: string }[];
  lessons: string[];
  stack: string[];
  links: { label: string; url: string }[];
  accent: string; // hue used by the project's generative cover
};

export const projects: Project[] = [
  {
    slug: "relay-omnichannel-agent",
    index: "01",
    title: "Relay",
    tagline: "An AI agent that sells and supports across six channels — inside strict, code-enforced rules.",
    year: "2025",
    role: "Lead AI engineer",
    status: "Production",
    category: "Agents",
    summary:
      "A multi-tenant omnichannel inbox where stores see Messenger, Instagram, WhatsApp, Telegram, email and web-widget conversations in one place, and an autonomous agent handles sales and support like a trained staff member.",
    problem:
      "Small retailers in Nepal answer hundreds of DMs a day across five apps, mostly in Nepali or Roman Nepali. Off-the-shelf chatbots hallucinated prices, double-created orders when customers said \"yes\" twice, and couldn't hand off to humans cleanly.",
    approach: [
      "\"The LLM chooses, code decides\": prices, totals, stock and IDs always come from tool results, never model text.",
      "Every action is one application service with two thin adapters — REST for the dashboard, a typed tool for the agent.",
      "Tool gating per sales state (browsing → cart → checkout), so the model physically cannot call create_order before confirmation.",
      "A pre-send checker validates every outbound message against tool results and policy before it reaches the customer.",
    ],
    architecture: [
      "Channel webhooks → ingress (verify + ack) → Postgres-backed job queue (Procrastinate)",
      "Workers: normalise → agent run → checker → outbound send",
      "PostgreSQL 16 + pgvector with row-level security for tenancy",
      "Groq primary, Gemini fallback, one OpenAI-compatible adapter",
      "Langfuse + OpenTelemetry traces for every run, tool call and token",
    ],
    decisions: [
      { title: "Own agent loop, no framework", body: "The loop is ~150 lines. The hard parts — tool gating, identity injection, idempotent orders — are domain rules no framework supplies." },
      { title: "Postgres as the job queue", body: "A message insert and its agent job commit in the same transaction: both happen or neither does. No outbox, no drift." },
      { title: "Idempotency keys on every write", body: "Webhooks retry, workers retry, customers say yes twice. Orders are keyed by conversation + cart hash." },
    ],
    results: [
      { metric: "Conversations resolved without a human", value: "71%", note: "across 14 pilot stores" },
      { metric: "Median reply latency", value: "1.3s", note: "from 4.1s" },
      { metric: "Hallucinated prices in production", value: "0", note: "since tool-only pricing" },
      { metric: "LLM cost per resolved conversation", value: "−62%" },
    ],
    lessons: [
      "Evals before features: the 420-conversation regression set caught three silent quality drops from \"harmless\" prompt edits.",
      "Treat every inbound message as a possible prompt injection — the checker exists because one did.",
    ],
    stack: ["Python 3.12", "FastAPI", "Pydantic v2", "SQLAlchemy 2", "PostgreSQL 16", "pgvector", "Procrastinate", "Redis", "Groq", "Gemini", "Next.js", "Langfuse"],
    links: [{ label: "Architecture write-up", url: "/blog" }],
    accent: "#ff5a36",
  },
  {
    slug: "sarathi-nepali-retrieval",
    index: "02",
    title: "Sarathi",
    tagline: "Retrieval that understands Nepali, Devanagari and the Roman Nepali people actually type.",
    year: "2025",
    role: "Author",
    status: "Open source",
    category: "Retrieval",
    summary:
      "An open benchmark and retrieval toolkit for Nepali and Roman-Nepali search — 2,400 hand-labelled query/passage pairs and a hybrid retriever that beats multilingual embeddings alone.",
    problem:
      "Most Nepali users type in Roman script (\"kati ho price?\"), but embeddings are trained on Devanagari. Retrieval quality for local RAG apps silently collapses on real queries.",
    approach: [
      "Built a labelled benchmark from support tickets and forum posts across both scripts.",
      "Compared 7 embedding models, BM25, and hybrid fusion with a transliteration-aware query expander.",
      "Released the eval harness so anyone can score a new model in one command.",
    ],
    architecture: [
      "Transliteration layer (rule-based + learned) → dual-script query expansion",
      "BM25 + dense retrieval with reciprocal rank fusion",
      "Cross-encoder rerank on the top 50",
    ],
    decisions: [
      { title: "Hybrid over pure dense", body: "Brand names and prices are lexical; intent is semantic. Fusion wins on both." },
      { title: "Benchmark first", body: "Without a Nepali eval set, every model claim was a vibe." },
    ],
    results: [
      { metric: "Recall@10 on Roman-Nepali queries", value: "0.84", note: "vs 0.52 dense-only" },
      { metric: "Labelled query/passage pairs", value: "2,400" },
      { metric: "Models benchmarked", value: "7" },
    ],
    lessons: ["The query expander mattered more than the embedding model."],
    stack: ["Python", "sentence-transformers", "rank-bm25", "FAISS", "pgvector", "Hugging Face"],
    links: [{ label: "GitHub", url: "https://github.com/rahuldevbanjara" }],
    accent: "#ffc53d",
  },
  {
    slug: "certlab-aws-exam-simulator",
    index: "03",
    title: "CertLab",
    tagline: "A practice-exam simulator for the AWS ML Engineer certification, with class-wide insight for instructors.",
    year: "2025",
    role: "Designer & engineer",
    status: "Live",
    category: "Education",
    summary:
      "A Next.js + MongoDB exam platform with timed exam mode, explained practice mode, domain-weighted full mocks, and an instructor dashboard that shows exactly where a cohort is struggling.",
    problem:
      "My AWS students practised on static PDFs. I couldn't see which domains, services or trap questions the class kept missing until the real exam.",
    approach: [
      "Questions as YAML files validated at boot — editable by any instructor, diffable in git.",
      "Exam mode mirrors the real test: timer, flag-for-review, no answers until submit; saves as you go across devices.",
      "Class insights: accuracy by domain/topic/service, most-missed and trap questions, and a printable revision deck.",
    ],
    architecture: [
      "Next.js App Router + Server Actions for every write",
      "MongoDB Atlas for attempts and results; iron-session cookies",
      "Question bank loaded server-side, sent only for the active exam",
    ],
    decisions: [
      { title: "YAML over a CMS", body: "Instructors review question changes as pull requests." },
      { title: "Weighted mocks", body: "Full mocks draw 65 questions weighted 28/24/24/24% by exam domain." },
    ],
    results: [
      { metric: "Students using it", value: "180+" },
      { metric: "Cohort pass rate", value: "89%", note: "first attempt" },
      { metric: "Questions answered", value: "41k" },
    ],
    lessons: ["\"Most often missed\" turned out to be less useful than \"confidently wrong\" — trap questions became the core revision tool."],
    stack: ["Next.js 16", "Mantine", "MongoDB", "iron-session", "YAML"],
    links: [{ label: "Case study", url: "/work/certlab-aws-exam-simulator" }],
    accent: "#6f9bff",
  },
  {
    slug: "knowledge-vault",
    index: "04",
    title: "Knowledge Vault",
    tagline: "A personal wiki that an LLM writes and maintains — knowledge that compounds instead of rotting.",
    year: "2026",
    role: "Creator",
    status: "In progress",
    category: "Tools",
    summary:
      "An Obsidian vault where I curate sources and an LLM agent compiles them into linked concept pages, per-domain hubs and revision sheets — across system design, ML fundamentals, NLP/LLMs and AI agents.",
    problem: "Notes from courses, papers and docs piled up unlinked. Re-reading was slower than re-learning.",
    approach: [
      "Strict separation: raw/ is immutable source; wiki/ is entirely agent-maintained.",
      "Tags emerge from content; concepts spanning domains are promoted to shared hubs.",
      "Every operation is appended to a log, so the vault's history is auditable.",
    ],
    architecture: ["Claude Code agent + CLAUDE.md operating manual", "Obsidian Bases for live filtered views", "Markdown + wiki-links as the only data format"],
    decisions: [{ title: "No database", body: "Plain markdown keeps it portable, greppable and diffable forever." }],
    results: [
      { metric: "Concept pages", value: "310+" },
      { metric: "Domains", value: "4" },
    ],
    lessons: ["The operating manual is the product. Most quality gains came from editing CLAUDE.md, not the model."],
    stack: ["Claude Code", "Obsidian", "Markdown"],
    links: [],
    accent: "#3fcf9c",
  },
  {
    slug: "tekbay-lms",
    index: "05",
    title: "TekBay LMS",
    tagline: "A learning platform for cohort-based cloud and AI training.",
    year: "2026",
    role: "Backend architect",
    status: "In progress",
    category: "Education",
    summary:
      "A FastAPI + Next.js LMS for running cohorts: courses, batches, assignments and dashboards, designed to be read by new contributors on day one.",
    problem: "Running AWS and data-science cohorts on a patchwork of Drive, forms and spreadsheets.",
    approach: [
      "One-direction request flow: routers → services → db, with Pydantic schemas at every boundary.",
      "Design tokens straight from Figma into Tailwind v4's @theme.",
    ],
    architecture: ["FastAPI · Pydantic · SQLAlchemy (Python 3.14)", "Next.js App Router + Tailwind v4", "PostgreSQL"],
    decisions: [{ title: "Docs as onboarding", body: "Every folder's README explains what it holds and why — students contribute to it." }],
    results: [{ metric: "Cohorts planned on it", value: "6" }],
    lessons: ["Write the README before the router."],
    stack: ["FastAPI", "Pydantic", "SQLAlchemy", "Next.js", "Tailwind CSS v4", "PostgreSQL"],
    links: [],
    accent: "#c9b8ff",
  },
  {
    slug: "this-portfolio",
    index: "06",
    title: "This site",
    tagline: "A portfolio that is also an agent — with a visible trace, guardrails and a full admin observability stack.",
    year: "2026",
    role: "Everything, with Claude Code",
    status: "Live",
    category: "Agents",
    summary:
      "Next.js 16, React Three Fiber and a Gemini-powered agent that reads a typed knowledge base about me, shows its tool calls live, can drive the page, and tailors my résumé to any job description. Self-hosted, zero third-party data services.",
    problem: "Chat-with-my-résumé bots are everywhere and mostly unhelpful: an empty box, ungrounded answers, no trace.",
    approach: [
      "Tool-calling agent over a typed knowledge base — every answer cites the 'files' it read.",
      "Guardrails in three layers: input screening, a scoped system contract, and output checks.",
      "Every turn is traced to SQLite: steps, tokens, latency, verdicts — visible in /admin.",
    ],
    architecture: ["Next.js 16 (Cache Components) + React 19", "R3F + custom GLSL point-cloud shader", "Gemini 3.5 Flash-Lite with 3.8 Flash fallback", "node:sqlite — no ORM, no hosted DB"],
    decisions: [{ title: "Zero hosted services", body: "Blog, media, analytics and traces all live in one SQLite file on a volume I own." }],
    results: [
      { metric: "Third-party data services", value: "0" },
      { metric: "Lighthouse (static path)", value: "95+" },
    ],
    lessons: ["The best UI for an agent is one that shows its work."],
    stack: ["Next.js 16", "React 19", "Three.js", "GLSL", "GSAP", "Gemini", "SQLite"],
    links: [{ label: "Colophon", url: "/colophon" }],
    accent: "#ff5a36",
  },
];

export type Course = {
  id: string;
  title: string;
  audience: string;
  format: string;
  learners: string;
  description: string;
  topics: string[];
  outcome: string;
};

export const teaching = {
  philosophy: [
    "Explain why something is needed before showing how it works. People remember a tool once they've felt the problem it solves.",
    "Plain language first. If a student can't explain it back to me, I haven't taught it yet.",
    "Hands on keyboards early. Every session ends with something that runs.",
  ],
  stats: [
    { value: "AWS", label: "Machine Learning Engineer certification trainer" },
    { value: "TekBay", label: "Academy, since June 2025" },
    { value: "DevCorps", label: "AI Learners Community leader" },
  ],
  courses: [
    {
      id: "aws-ml",
      title: "AWS Machine Learning Engineer – Associate",
      audience: "Engineers and students preparing for the AWS ML Engineer certification",
      format: "TekBay Academy · labs + practice exams",
      learners: "",
      description: "SageMaker end to end — data preparation, training, tuning, deployment and monitoring — with hands-on labs and full practice exams.",
      topics: ["SageMaker", "Data preparation", "Deployment", "Model monitoring", "MLOps", "Exam strategy"],
      outcome: "Pass the AWS ML Engineer exam and deploy a monitored model.",
    },
    {
      id: "data-science",
      title: "Data Science with Python",
      audience: "Beginners, including people from non-IT backgrounds",
      format: "12-week course",
      learners: "",
      description: "From the basics of Python to NumPy, Pandas, statistics, visualisation, SQL and a first machine-learning project.",
      topics: ["Python", "NumPy & Pandas", "Statistics", "Visualisation", "SQL", "Machine learning"],
      outcome: "Finish an end-to-end analysis and an ML project for your portfolio.",
    },
  ] satisfies Course[],
  talks: [] as { title: string; event: string; date: string }[],
};

export const testimonials: { quote: string; name: string; title: string }[] = [];

export const skills = [
  { group: "LLM systems", items: ["Agent loops & tool use", "RAG & hybrid retrieval", "Evals & guardrails", "Prompt & context engineering", "Tracing (Langfuse, OTel)"] },
  { group: "ML", items: ["scikit-learn", "LightGBM / XGBoost", "PyTorch", "Hugging Face", "Forecasting", "Embeddings"] },
  { group: "AWS", items: ["SageMaker", "Bedrock", "Lambda", "Step Functions", "S3 / IAM / VPC"] },
  { group: "Backend", items: ["Python", "FastAPI", "Pydantic", "PostgreSQL + pgvector", "Redis", "Docker"] },
  { group: "Frontend", items: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Three.js"] },
];

export const now = {
  updated: "2026-10-13",
  items: [
    { label: "Building", text: "A tool-gated checkout agent for Relay that speaks Roman Nepali." },
    { label: "Teaching", text: "Week 6 of Data Science with Python — Pandas, and the joy of groupby." },
    { label: "Reading", text: "Designing Machine Learning Systems (again) and every eval paper I can find." },
    { label: "Learning", text: "GPU-side particle simulation in GLSL — partly for this website." },
    { label: "Training", text: "Hiking Shivapuri every other Saturday." },
  ],
};

export const uses = [
  {
    group: "Daily drivers",
    items: [
      { name: "Claude Code", note: "My primary pair-programmer. This site was built with it end-to-end." },
      { name: "Omarchy (Arch + Hyprland)", note: "Keyboard-first Linux desktop." },
      { name: "Neovim + VS Code", note: "Neovim for editing, VS Code for notebooks and debugging." },
      { name: "Ghostty", note: "Terminal." },
    ],
  },
  {
    group: "AI & data",
    items: [
      { name: "uv", note: "Python packaging that finally feels fast." },
      { name: "Langfuse", note: "Traces and evals for every agent I ship." },
      { name: "Jupyter / Colab", note: "Exploration and teaching." },
      { name: "Obsidian", note: "Home of the LLM-maintained knowledge vault." },
    ],
  },
  {
    group: "Infra",
    items: [
      { name: "PostgreSQL + pgvector", note: "The default answer to 'where does this live?'" },
      { name: "Docker Compose", note: "Local infra for everything." },
      { name: "AWS", note: "SageMaker, Bedrock, Lambda, S3." },
      { name: "Cloudflare Tunnel", note: "Public webhook URLs from my laptop." },
    ],
  },
];

/** What you can hire Rahul for. Drives /services, the home "Work with me" block, and the agent. */
export const services = [
  {
    id: "agents",
    title: "Production AI agents",
    for: "Startups & product teams",
    pitch: "An agent that takes real actions — orders, tickets, bookings — without hallucinating the parts that matter.",
    deliverables: ["Tool-gated agent loop on your stack", "Eval suite + regression gate in CI", "Tracing, cost and latency dashboards", "Hand-off to humans that actually works"],
    engagement: "4–10 week build",
    outcome: "You get an agent your team can trust with real customers, plus the tests to keep it that way.",
  },
  {
    id: "rag",
    title: "Retrieval & RAG that you can trust",
    for: "Teams with documents, tickets or catalogs",
    pitch: "Search and question-answering over your data with citations, hybrid retrieval and measured faithfulness — including Nepali & Roman Nepali.",
    deliverables: ["Retrieval benchmark on your data", "Hybrid search (BM25 + vectors) on Postgres", "Citation-checked answers", "Faithfulness & recall reports"],
    engagement: "3–6 weeks",
    outcome: "You get search that finds the right document, with every answer linked to its source.",
  },
  {
    id: "audit",
    title: "AI system audit",
    for: "Teams with an LLM feature in production",
    pitch: "A fixed-scope review of your prompts, tools, evals, costs and failure modes — with a prioritised fix list.",
    deliverables: ["Architecture & prompt review", "Prompt-injection and data-leak tests", "Cost / latency teardown", "Written report + 90-min walkthrough"],
    engagement: "1–2 weeks, fixed price",
    outcome: "You get a clear, prioritised list of what to fix first — and why.",
  },
  {
    id: "training",
    title: "Corporate training",
    for: "Engineering & data teams",
    pitch: "Hands-on workshops in Python, data science, ML on AWS and LLM engineering, from someone who teaches the AWS ML Engineer certification.",
    deliverables: ["Custom curriculum for your stack", "Live labs on your AWS account", "Exam prep for AWS ML certifications", "Recordings & materials to keep"],
    engagement: "1-day workshop to 12-week program",
    outcome: "Your team leaves able to build, deploy and monitor ML on AWS themselves.",
  },
];

export const workProcess = [
  { step: "01", title: "Intro call", body: "30 minutes. Your problem, your constraints, whether I'm the right person. No pitch deck." },
  { step: "02", title: "Written proposal", body: "Scope, milestones, the evals that define \"done\", and a fixed price or weekly rate — within 48 hours." },
  { step: "03", title: "Build in the open", body: "Weekly demos, a shared trace dashboard, and code in your repo from day one." },
  { step: "04", title: "Hand-over", body: "Docs, runbooks and a recorded walkthrough so your team owns it completely." },
];

export const faqs = [
  { q: "Are you available for full-time roles?", a: "Yes — I'm open to AI engineering roles (remote or hybrid) and select contracts. The fastest way to reach me is the contact form or email." },
  { q: "What time zone do you work in?", a: "Nepal (UTC+5:45). I overlap comfortably with EU mornings and US East evenings, and I'm used to async-first teams." },
  { q: "Which stacks do you work in?", a: "Mostly Python (FastAPI), PostgreSQL + pgvector, AWS (SageMaker, Bedrock), and Next.js — but I'll work in yours." },
  { q: "Do you sign NDAs?", a: "Yes, routinely." },
];

/** Suggested prompts shown in the agent console. */
export const agentSuggestions = [
  "What has Rahul built with LLM agents?",
  "Is he available, and how do I contact him?",
  "Which AWS certifications does he hold?",
  "What does he teach?",
  "Walk me through Relay's architecture",
  "Show me his writing",
];
