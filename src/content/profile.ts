/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE SINGLE SOURCE OF TRUTH ABOUT RAHUL.
 *  Every page, the résumé, /llms.txt, resume.json AND the AI agent's knowledge
 *  base are generated from this file. Edit facts here and everything follows.
 *
 *  Real data, supplied by Rahul. Optional project fields stay empty until
 *  there's something real to say — pages hide what's missing.
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
  /** Short lines for the About page list. */
  highlights: string[];
  /** The full story, shown on /experience/[id] and the résumé. */
  details: { title: string; text: string; links?: { label: string; url: string }[] }[];
  results: { metric: string; value: string; note?: string }[];
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
    summary: "Building RAG systems, ML platforms and internal tools for client products.",
    highlights: [
      "An explainable churn-prevention platform that saves a client over $100K a year.",
      "Healthcare RAG for doctors and patients on Amazon Bedrock Knowledge Bases, comparing MedGemma on SageMaker with Claude Sonnet on Bedrock.",
      "Layout-preserving OCR, website RAG chatbots and an AWS cost-tracking dashboard.",
    ],
    details: [
      {
        title: "Churn-prevention platform",
        text: "Built a predictive, explainable churn-prevention platform for a managed service provider client (10K+ client companies) that saved the client over $100K/year by catching churn early. Engineered monthly trend-based features from messy real-world data via Presto/Iceberg, added per-customer SHAP explainability, and used DoWhy causal inference — served via an IBM Code Engine hosted, Auth0-secured Streamlit dashboard.",
      },
      {
        title: "Healthcare RAG for doctors and patients",
        text: "Built a healthcare RAG system serving doctors and patients. Retrieval always runs on Amazon Bedrock Knowledge Bases, with query decomposition and reranking to cut missed and hallucinated details, and metadata filtering to keep each tenant's data separate. For generation, deployed MedGemma on SageMaker endpoints and compared it against Claude Sonnet on Amazon Bedrock. Protected answers with Amazon Bedrock Guardrails, and monitored the system with Bedrock monitoring and CloudWatch metrics. Shipped dual response personas (clinical jargon for doctors, plain language for patients) — validated answer quality with practicing physicians.",
      },
      {
        title: "RAG chatbots for client websites",
        text: "Built RAG chatbots for client website landing pages, answering visitor Q&A with latency-focused prompt engineering, context budgeting, and NeMo Guardrails to block jailbreak attempts.",
      },
      {
        title: "Layout-preserving OCR",
        text: "Shipped an OCR pipeline preserving multi-column layout by combining layout analysis, OCR, and a vision-language model for post-processing — reconstructs documents with correct structure and reading order.",
      },
      {
        title: "AWS cost-tracking dashboard",
        text: "Built an internal AWS cost-tracking dashboard over Athena queries against terabytes of CloudTrail logs, grouping resources by project, department, and compliance tags — cut the company's wasted AWS spend and gave finance a clear cost-allocation view every month.",
      },
    ],
    results: [
      { metric: "Saved per year for a churn-prevention client", value: "$100K+" },
      { metric: "Client companies covered by the churn platform", value: "10K+" },
    ],
    stack: ["Bedrock Knowledge Bases", "Bedrock Guardrails", "SageMaker endpoints", "MedGemma", "Claude Sonnet", "CloudWatch", "NeMo Guardrails", "SHAP", "DoWhy", "Presto / Iceberg", "Athena", "Streamlit"],
  },
  {
    id: "tekbay",
    company: "TekBay Academy",
    role: "AWS Machine Learning Trainer",
    type: "Part-time",
    location: "Kathmandu, Nepal",
    start: "2025-06",
    end: null,
    summary: "Designed and teach the AWS Certified Machine Learning Engineer – Associate course — built for MLA-C01, redesigned for MLA-C02.",
    highlights: [
      "Designed the 3-month MLA-C01 curriculum from scratch, then redesigned it for MLA-C02 when AWS updated the exam.",
      "Taught three in-person batches, with a 100% pass rate in the first.",
      "Recorded a studio lecture series now used by 100+ remote students across India and Nepal.",
      "Mentoring MLA-C02 students to build production-grade AI agents on Amazon Bedrock AgentCore.",
    ],
    details: [
      {
        title: "A curriculum built to be reused",
        text: "Designed a complete 3-month curriculum for AWS Certified ML Engineer (MLA-C01) from scratch — all exam domains, 8 mock exam sets, hands-on labs, and capstone projects — so the academy can reuse it for every new batch without starting over. When AWS updated the exam from MLA-C01 to MLA-C02, redesigned the course for the new version.",
      },
      {
        title: "Scenario-first teaching",
        text: "Introduced a scenario-based teaching approach — walking through a real problem first and then showing how the concept solves it, instead of reading off slides — keeping beginners engaged and more likely to finish the course and recommend it to others.",
      },
      {
        title: "A recorded course for remote students",
        text: "Recorded a full studio-quality lecture series, turning a one-time recording into a course the academy can keep selling — now guiding 100+ remote students across India and Nepal through their ML journey without teaching it live again.",
      },
      {
        title: "Mentoring production AI agents",
        text: "Mentoring students in the MLA-C02 course to build production-grade AI agents on Amazon Bedrock AgentCore as their learning project — not just the agent, but the harness it needs to run in production: memory, observability, and MCP tools through AgentCore Gateway.",
      },
      {
        title: "In-person batches",
        text: "Taught three in-person batches so far — 60+ students across the first two — turning them into certified AWS ML Engineers, including a 100% pass rate in the first batch, a result the academy can use to attract more students.",
      },
    ],
    results: [
      { metric: "Pass rate in the first batch", value: "100%" },
      { metric: "Remote students on the recorded course", value: "100+" },
      { metric: "In-person batches taught", value: "3" },
      { metric: "Mock exam sets written", value: "8" },
    ],
    stack: ["AWS SageMaker", "Bedrock AgentCore", "MCP", "MLA-C01", "MLA-C02", "MLOps", "Curriculum design", "Teaching"],
  },
  {
    id: "fusemachines",
    company: "Fusemachines",
    role: "AI Fellow",
    type: "Fellowship",
    location: "Kathmandu, Nepal",
    start: "2024-03",
    end: "2024-10",
    summary: "A fully funded, industry-focused AI Fellowship, completing the Fusemachines Microdegree™ in Artificial Intelligence.",
    highlights: [
      "Built a document verification system for government ID fraud detection (98% classification accuracy).",
      "Computer vision for governance, plus transformer-based NLP models.",
      "Completed the Microdegree™ in Artificial Intelligence.",
    ],
    details: [
      {
        title: "The fellowship",
        text: "Completed a fully-funded, industry-focused AI Fellowship building ML systems across computer vision, NLP, and LLMs, with emphasis on model evaluation, training workflows, and MLOps for real-world deployment.",
      },
      {
        title: "Document Verification System",
        text: "Built a Document Verification System for government ID fraud detection: trained on synthetic template overlays (where confidential real data is unavailable), YOLOv8 field detection, EasyOCR/PaddleOCR extraction, and fuzzy database cross-validation — 98% classification accuracy, 82.6% end-to-end verification accuracy.",
        links: [{ label: "GitHub", url: "https://github.com/devrahulbanjara/Document-Verification-System" }],
      },
      {
        title: "Computer vision for governance, and NLP",
        text: "Engineered a Computer Vision and AI for Governance project, applying deep learning models to public-sector and compliance problems; separately built NLP models for sentiment analysis and text classification using transformer-based architectures.",
      },
      {
        title: "Training",
        text: "Completed intensive training in Supervised and Unsupervised Learning, Deep Neural Networks, and Deep Generative Models, with structured research-paper reading sessions.",
      },
    ],
    results: [
      { metric: "Document classification accuracy", value: "98%" },
      { metric: "End-to-end verification accuracy", value: "82.6%" },
    ],
    stack: ["YOLOv8", "EasyOCR", "PaddleOCR", "Transformers", "Computer vision", "NLP"],
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
  year?: string;
  role?: string;
  status?: "Production" | "Live" | "Open source" | "Research" | "In progress";
  category: "Platform" | "Agents" | "Retrieval" | "MLOps" | "Speech" | "Education" | "Tools";
  summary: string;
  problem?: string;
  /** What I built — one line per piece of work. */
  approach: string[];
  architecture?: string[];
  decisions?: { title: string; body: string }[];
  results: { metric: string; value: string; note?: string }[];
  lessons?: string[];
  stack: string[];
  links: { label: string; url: string }[];
  accent: string; // hue used by the project's generative cover
};

export const projects: Project[] = [
  {
    slug: "convexhire",
    index: "01",
    title: "ConvexHire",
    tagline: "A production-grade hiring platform that runs the whole recruitment funnel end to end, with AI where it helps.",
    category: "Platform",
    summary:
      "A full hiring platform for candidates, recruiters and company admins: job posting, applications, AI evaluation and shortlisting, outreach, interview booking, interview transcription and offers. AI assists at each step, and a person makes every decision.",
    approach: [
      "Built a full-stack HR tech platform (recruitment, onboarding, AI-assisted hiring): FastAPI backend, Next.js frontend shipped via Claude Code (AI-assisted UI development), AWS Bedrock with LangGraph multi-agent workflows (parallel CTO/HR persona nodes, critique-judge with early-exit), tool and function calling, job-draft human-in-the-loop interrupts, and a recruiter chatbot with a full custom tool suite.",
      "The product side: three roles (candidate, recruiter, recruiter admin) with OTP email verification, Google sign-in and refresh-token sessions; a resume builder with AI PDF import and PDF export; a five-step apply flow; recruiter dashboards, outreach review, notifications and a company-wide audit log.",
      "Cut LLM inference cost ~80% via a two-stage ML bouncer (only top-scoring applicants reach Bedrock agents); Bedrock prompt caching, Redis caching, and an intent router keep per-query cost low.",
      "Built Qdrant hybrid search (Gemini dense + BM25, RRF fusion) for jobs and candidates, plus a job-creation multi-agent drafting complete postings from keywords and past job references.",
      "Engineered fairness and compliance safeguards: structural PII exclusion and redaction, a custom prompt-injection classifier, human-in-the-loop confirmation on agent-proposed writes, and LangSmith tracing.",
    ],
    architecture: [
      "Candidates apply with a saved resume, and can run an AI gap analysis against the job first. An optional auto-patch rewrites their summary and bullets but can't touch frozen facts (company, title, dates, institution, certifications), and they approve every change.",
      "When a job closes, a scikit-learn RandomForest scores every application in milliseconds; only the top 20% go on to the LLM stage.",
      "CTO and HR persona agents on AWS Bedrock review each remaining resume; a judge exits early once it's confident, and a cheaper model merges the result into strengths, concerns and evidence.",
      "Shortlisted candidates get a drafted invite with a Cal.com booking link and rejected ones get feedback. Nothing is sent until a recruiter approves it.",
      "A Cal.com webhook moves the application forward when an interview is booked. Interview audio is transcribed by my fine-tuned Nepali Whisper model on a Hugging Face Space and scored against a per-job rubric, next to the recruiter's own evaluation.",
    ],
    decisions: [
      { title: "AI assists, people decide", body: "Every shortlist, every email and every job edit made through the chat is confirmed by a recruiter. Job edits show a before-and-after preview and only touch an allowlist of 14 fields." },
      { title: "Shortlisting opens only after a job closes", body: "Evaluation waits until the application window ends, so every applicant gets the same fair chance." },
      { title: "Cost-aware by design", body: "A rule-based intent router answers most recruiter chat messages without calling an LLM, the ML pre-filter keeps most resumes away from the expensive models, and prompt caching reuses the job description across agents." },
      { title: "Defence in depth", body: "Prompt-injection screening on every user-controlled input, PII redaction before the shortlisting prompts, rate limits, idempotency keys and row-level locks against double submits and concurrent edits." },
    ],
    results: [
      { metric: "Lower LLM inference cost", value: "~80%", note: "vs. sending every resume to an LLM" },
      { metric: "Of applicants reach the LLM stage — only the top scorers", value: "20%" },
      { metric: "To first token in recruiter chat", value: "<0.7s" },
    ],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Redis", "Qdrant", "LangGraph", "AWS Bedrock", "Groq", "NeMo Guardrails", "S3"],
    links: [{ label: "GitHub", url: "https://github.com/devrahulbanjara/ConvexHire" }],
    accent: "#6f9bff",
  },
  {
    slug: "omnichannel-ai-inbox",
    index: "02",
    title: "Omnichannel AI Inbox",
    tagline: "Still being built — one inbox for every channel, with an AI agent that sells and supports.",
    status: "In progress",
    category: "Agents",
    summary:
      "Work in progress. A multi-tenant platform where stores see customer messages from every channel in one inbox, and an AI agent sells, supports and operates like a trained staff member — within strict, code-enforced rules.",
    approach: [
      "Designing one inbox for the web widget, Telegram, Messenger, Instagram, WhatsApp and email, with orders, tickets and a contact timeline across channels.",
      "Writing my own agent loop (no framework) where the LLM chooses but code decides: prices, totals, stock and IDs always come from the database or tool results, never from model text.",
      "Building for safety from the start: server-injected identity, idempotent writes (customers say \"yes\" twice), every inbound message treated as a possible prompt injection, and every AI run, tool call and cost recorded.",
      "Stack: FastAPI and Pydantic, PostgreSQL with pgvector and row-level security for tenancy, a Postgres-backed job queue, Groq with Gemini as fallback, and a Next.js dashboard.",
    ],
    results: [],
    stack: ["FastAPI", "PostgreSQL + pgvector", "Groq / Gemini", "Next.js", "Redis"],
    links: [],
    accent: "#ff8a5c",
  },
  {
    slug: "agentic-layout-aware-retrieval",
    index: "03",
    title: "Agentic Layout-Aware Retrieval",
    tagline: "Layout-aware ingestion and agentic retrieval over complex arXiv research papers.",
    category: "Retrieval",
    summary: "A retrieval system for complex arXiv PDFs: layout-aware parsing and structure-aware chunking on the way in, three-lane hybrid search and an agentic reasoning layer on the way out.",
    approach: [
      "Built an indexing pipeline over complex arXiv PDFs: Docling layout-aware parsing, optional GROBID reference extraction, and structure-aware multi-granularity chunking (paragraphs, tables, figures, equations) with Pydantic schema enforcement.",
      "Indexed into Qdrant with BGE-M3: three-lane hybrid search (keyword sparse, content dense, hypothetical-question dense), RRF fusion, cross-encoder reranking, and conditional MMR; metadata filtering and citation-ready payloads for grounded retrieval.",
      "Built a ReasoningEngine on top (intent classification, query decomposition, RAG fusion, metadata-driven filters), served through FastAPI.",
    ],
    results: [],
    stack: ["Docling", "GROBID", "Qdrant", "BGE-M3", "FastAPI", "Pydantic"],
    links: [{ label: "GitHub", url: "https://github.com/devrahulbanjara/Agentic-RAG" }],
    accent: "#c9b8ff",
  },
  {
    slug: "insurance-rag-eval",
    index: "04",
    title: "Insurance RAG Eval",
    tagline: "A RAG I can measure: change anything, rerun the suite, and see which metrics move up or down.",
    category: "Retrieval",
    summary:
      "A deliberately simple RAG over insurance policy documents, built to be measured rather than to be state of the art. Every metric has a baseline, so after any change — a prompt, the chunking, the model, the retriever — I rerun the suite and see exactly which dials went up, which went down, and which part of the pipeline moved them.",
    problem:
      "Most RAG projects are judged by how a few demo questions go, with no numbers behind them. So when you change something, you can't tell whether it helped, hurt, or quietly broke something else — and the worst failure, an answer that's fluent, faithful to what was retrieved and still wrong, looks fine in a demo. I wanted every change to show up as numbers going up or down.",
    approach: [
      "Built a simple RAG over real insurance policy wordings (including NFIP flood forms and HDFC ERGO health policies) and a hand-crafted golden dataset of 20 queries with ideal answers written from the policy text.",
      "Evaluated four levels separately so every wrong answer can be traced to its cause: the retriever (contextual precision and recall), the generator in isolation fed golden context (faithfulness, answer relevance), the full pipeline (contextual relevancy, faithfulness, answer relevance), and the application (correctness and completeness, judged with G-Eval).",
      "Used DeepEval with an LLM judge; a query passes at 0.7. Every run is appended to a results log, so after any change to the RAG the whole suite reruns and each metric is compared against the baseline — a regression check for RAG.",
    ],
    decisions: [
      {
        title: "Why insurance policies",
        body: "A policy grants cover in one clause and takes it back in an exclusion written in almost the same words. To an embedding model they're nearly the same vector, so a retriever can rank the exclusion first, and the generator then writes a faithful answer that says the opposite of what the policy means. Faithfulness calls it fine; only contextual precision catches it.",
      },
      {
        title: "Generator alone vs. the full pipeline",
        body: "The same generator metrics are run twice — once with golden context, once with what the retriever pulled. If faithfulness drops only in the pipeline, the retriever caused it, not the model.",
      },
      {
        title: "Completeness as its own metric",
        body: "\"Is knee replacement covered?\" needs three facts from three sections: the grant, the 24-month waiting period and the exclusion. \"Yes, it's covered\" is faithful and relevant, and still gets a customer's claim rejected.",
      },
    ],
    results: [
      { metric: "Baseline generator faithfulness, with golden context", value: "0.97" },
      { metric: "Baseline faithfulness with the retriever's chunks", value: "0.73" },
      { metric: "Baseline contextual relevancy — most retrieved text is noise", value: "0.30" },
      { metric: "Baseline answers that left out a key point", value: "11/20" },
    ],
    lessons: [
      "The baseline already tells a story: the generator is nearly perfect on its own, and most of the loss comes from retrieval — it finds most of what's needed (recall 0.80) but ranks it poorly (precision 0.56). That's exactly the kind of answer the suite is for: when something changes, it points at the knob that moved.",
    ],
    stack: ["DeepEval", "G-Eval", "Pinecone", "RAG", "Python", "uv"],
    links: [{ label: "GitHub", url: "https://github.com/devrahulbanjara/RAG-eval" }],
    accent: "#5ac8fa",
  },
  {
    slug: "nirantar",
    index: "05",
    title: "Nirantar",
    tagline: "A health-tracking PWA that Claude can read through MCP.",
    category: "Tools",
    summary: "An installable health PWA with a multi-tenant MCP server, so assistants like Claude can reason over your own health history.",
    approach: [
      "Built a full-stack installable PWA: FastAPI backend and frontend shipped via Claude Code (AI-assisted UI development), with a multi-tenant MCP server exposing scoped tools, so MCP clients like Claude decide exactly which data they need to answer each question.",
      "Implemented OAuth authentication (Clerk) with per-user data scoping, so every connected assistant sees only that user's own data, with zero manual credential entry during setup.",
      "Deployed and remotely hosted both the web app and the MCP endpoint on a custom domain, integrated through Claude Desktop's connector system — turning Claude into a personalized assistant that reasons over the user's own historical data.",
    ],
    results: [],
    stack: ["MCP", "PWA", "FastAPI", "OAuth", "Clerk"],
    links: [{ label: "GitHub", url: "https://github.com/devrahulbanjara/nirantar" }],
    accent: "#ff5a36",
  },
  {
    slug: "insurance-claim-fraud-detection",
    index: "06",
    title: "Insurance Fraud Detection",
    tagline: "An end-to-end AWS MLOps pipeline for insurance claim fraud detection.",
    category: "MLOps",
    summary: "An ingest-to-deployment AWS MLOps pipeline with a model registry, approval gates, and live drift detection.",
    approach: [
      "Built a full ingest-to-deployment AWS MLOps pipeline for insurance claim fraud detection — SageMaker Feature Store for engineered features, SMOTE-balanced training, and XGBoost tuned via SageMaker Automatic Model Tuning, orchestrated end-to-end as a single SageMaker Pipeline.",
      "Registered every model in SageMaker Model Registry with attached metrics and bias reports behind a manual approval gate, deployed to a real-time endpoint, and wired a CI/CD pipeline that redeploys the latest approved model on every push.",
      "Implemented drift detection on live traffic (SageMaker Data Capture + Evidently) against the training baseline, CloudFormation-managed infrastructure, autoscaling inference endpoints, and CloudWatch dashboards for latency, errors, and cost.",
    ],
    results: [],
    stack: ["SageMaker", "XGBoost", "Evidently", "CloudFormation", "CloudWatch", "MLOps"],
    links: [],
    accent: "#3fcf9c",
  },
  {
    slug: "nepali-asr",
    index: "07",
    title: "Nepali ASR",
    tagline: "Whisper Small, fine-tuned for Devanagari Nepali speech.",
    status: "Open source",
    category: "Speech",
    summary: "Fine-tuned Whisper Small for Devanagari Nepali, cutting word error rate from 130.80% to 31.64%.",
    approach: [
      "Fine-tuned OpenAI's Whisper Small on a Nepali speech corpus, dropping WER from 130.80% to 31.64% and CER from 66.24% to 7.27% on the held-out evaluation split.",
      "Built the full training pipeline in Hugging Face Transformers and datasets — audio resampling, log-mel feature extraction, Devanagari tokenizer setup, and mixed-precision training.",
      "Deployed the fine-tuned model to Hugging Face Hub and Spaces for public inference, filling a gap where reliable Devanagari Nepali ASR is otherwise unavailable from off-the-shelf APIs.",
    ],
    results: [
      { metric: "Word error rate", value: "31.64%", note: "from 130.80%" },
      { metric: "Character error rate", value: "7.27%", note: "from 66.24%" },
    ],
    stack: ["Whisper", "Hugging Face", "Transformers", "Fine-tuning"],
    links: [{ label: "Hugging Face", url: "https://huggingface.co/devrahulbanjara/whisper-small-nepali" }],
    accent: "#ffc53d",
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
      description: "Updated for the MLA-C02 exam. SageMaker end to end — data preparation, training, tuning, deployment and monitoring — with hands-on labs and full practice exams, plus a mentored project building a production-grade AI agent on Amazon Bedrock AgentCore.",
      topics: ["SageMaker", "Data preparation", "Deployment", "Model monitoring", "MLOps", "Bedrock AgentCore", "Exam strategy"],
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
  {
    group: "LLM & agentic AI",
    items: ["RAG", "LangGraph", "Multi-agent workflows", "Tool & function calling", "MCP servers", "Structured output (Pydantic, JSON Schema)", "Prompt engineering & caching", "Guardrails", "Fine-tuning", "LLM evaluation (DeepEval, G-Eval)", "AWS Bedrock", "LangChain", "LangSmith", "OpenAI", "Hugging Face"],
  },
  {
    group: "Retrieval & documents",
    items: ["Hybrid search", "Reranking", "MMR", "Query decomposition", "Docling", "GROBID", "Vector stores (Qdrant, Pinecone, Bedrock KB, Algolia)", "OCR & VLM (EasyOCR, PaddleOCR, Textract)"],
  },
  {
    group: "ML & deep learning",
    items: ["PyTorch", "TensorFlow", "Computer vision", "NLP", "Transformers", "scikit-learn", "XGBoost", "SHAP", "Causal inference (DoWhy)", "Whisper", "YOLO", "ResNet"],
  },
  {
    group: "MLOps & cloud",
    items: ["AWS (SageMaker, Bedrock, Lambda, Textract, Athena, S3)", "Docker", "MLflow", "CI/CD", "Feature Store", "Model Registry", "IBM Cloud (Code Engine, COS)"],
  },
  {
    group: "Backend & data",
    items: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "Apache Airflow", "Qdrant", "Neo4j", "Iceberg", "Presto", "CloudWatch"],
  },
  { group: "Languages", items: ["Python", "JavaScript", "SQL"] },
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
