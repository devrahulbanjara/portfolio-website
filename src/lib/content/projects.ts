import type { Project } from "./types";

/**
 * Three flagship projects plus one archive entry.
 *
 * NOTE: "Churn Intelligence Platform" is deliberately NOT here. It is Adex
 * International client work, not a personal project, so it lives in
 * ./experience.ts. Publishing it as a project would misrepresent ownership and
 * risk client confidentiality.
 *
 * Gaps, tracked rather than papered over:
 *   - insurance-claim-fraud-detection has no public repository link
 *   - nepali-asr has no repository link (model is public on the Hub)
 *   - no project has a screenshot yet, so imageUrl is null everywhere and cards
 *     must render without one
 */
export const projects: readonly Project[] = [
  {
    slug: "nirantar",
    title: "Nirantar – Health Tracking PWA with MCP AI Integration",
    shortTitle: "Nirantar",
    summary:
      "An installable health PWA with a multi-tenant MCP server, so assistants like Claude can reason over your own health history.",
    highlights: [
      "Built a full-stack installable PWA with a multi-tenant MCP server exposing scoped tools, so MCP clients like Claude decide exactly which data they need to answer each question",
      "Implemented OAuth authentication (Clerk) with per-user data scoping, so every connected assistant sees only that user's own data, with zero manual credential entry during setup",
      "Deployed and remotely hosted both the web app and the MCP endpoint on a custom domain, integrated through Claude Desktop's connector system, turning Claude into a personalized assistant that reasons over the user's own historical data",
    ],
    technologies: ["MCP", "PWA", "FastAPI", "OAuth", "Clerk"],
    links: [
      {
        kind: "repository",
        label: "GitHub",
        url: "https://github.com/devrahulbanjara/nirantar",
      },
    ],
    imageUrl: null,
    flagship: true,
    hasCaseStudy: true,
  },
  {
    slug: "convexhire",
    title: "ConvexHire – AI-Powered Hiring Platform",
    shortTitle: "ConvexHire",
    summary:
      "A multi-agent recruiting platform that cut LLM inference cost roughly 80% while shortening shortlisting from hours to minutes.",
    highlights: [
      "Cut LLM inference cost roughly 80% by routing candidates through a lightweight ML classifier that filters out unfit applicants before any expensive LLM token is spent",
      "Orchestrated a multi-agent shortlisting pipeline (parallel CTO/HR persona nodes, critique-judge with early-exit, model-tier splitting) that reaches a decision in minutes instead of hours, with prompt caching and an intent router keeping per-query LLM cost low",
      "Built a recruiter chatbot with a full custom tool suite so recruiters can run the platform through conversation, plus a job-creation multi-agent drafting complete postings from a few keywords and past job references, skipping manual form-filling",
      "Built a hybrid job-search engine blending keyword and semantic search with RRF reranking, so the right candidates surface whether or not they used the exact words in the job description",
      "Engineered fairness and compliance safeguards: PII redaction against identity-based bias, NVIDIA NeMo Guardrails against prompt injection, and human-in-the-loop confirmation on every agent-proposed decision",
    ],
    technologies: [
      "LangGraph",
      "Multi-Agent",
      "FastAPI",
      "RAG",
      "NeMo Guardrails",
    ],
    links: [
      {
        kind: "repository",
        label: "GitHub",
        url: "https://github.com/devrahulbanjara/ConvexHire",
      },
    ],
    imageUrl: null,
    flagship: true,
    hasCaseStudy: true,
  },
  {
    slug: "insurance-claim-fraud-detection",
    title:
      "Insurance Claim Fraud Detection – End-to-End AWS MLOps Pipeline",
    shortTitle: "Insurance Fraud Detection",
    summary:
      "An ingest-to-deployment AWS MLOps pipeline with a model registry, approval gates, and live drift detection.",
    highlights: [
      "Built a full ingest-to-deployment AWS MLOps pipeline for insurance claim fraud detection: SageMaker Feature Store for engineered features, SMOTE-balanced training, and XGBoost tuned via SageMaker Automatic Model Tuning, orchestrated end-to-end as a single SageMaker Pipeline",
      "Registered every model in SageMaker Model Registry with attached metrics and bias reports behind a manual approval gate, deployed to a real-time endpoint, and wired a CI/CD pipeline that redeploys the latest approved model on every push",
      "Implemented drift detection on live traffic (SageMaker Data Capture + Evidently) against the training baseline, CloudFormation-managed autoscaling, and CloudWatch dashboards for latency, errors, and cost",
      "When AWS restricted SageMaker Clarify access on new accounts, hand-implemented the underlying bias metrics and SHAP explainability directly against the trained model",
    ],
    technologies: [
      "SageMaker",
      "MLOps",
      "AWS",
      "XGBoost",
      "Evidently",
      "CloudFormation",
    ],
    links: [],
    imageUrl: null,
    flagship: true,
    hasCaseStudy: true,
  },
  {
    slug: "nepali-asr",
    title: "Nepali ASR – Fine-tuned Whisper Small for Devanagari Nepali",
    shortTitle: "Nepali ASR",
    summary:
      "Fine-tuned Whisper Small for Devanagari Nepali, cutting word error rate from 130.80% to 31.64%.",
    highlights: [
      "Fine-tuned OpenAI's Whisper Small on a Nepali speech corpus, dropping WER from 130.80% to 31.64% and CER from 66.24% to 7.27% on the held-out evaluation split",
      "Built the full training pipeline in Hugging Face Transformers and datasets: audio resampling, log-mel feature extraction, Devanagari tokenizer setup, and mixed-precision training",
      "Deployed the fine-tuned model to Hugging Face Hub and Spaces for public inference, filling a gap where reliable Devanagari Nepali ASR is otherwise unavailable from off-the-shelf APIs",
    ],
    technologies: ["Whisper", "ASR", "Hugging Face", "Fine-tuning"],
    links: [
      {
        kind: "model",
        label: "Hugging Face",
        url: "https://huggingface.co/devrahulbanjara/whisper-small-nepali",
      },
    ],
    imageUrl: null,
    flagship: false,
    hasCaseStudy: false,
  },
];

export const flagshipProjects = projects.filter((p) => p.flagship);
export const archiveProjects = projects.filter((p) => !p.flagship);
export const caseStudyProjects = projects.filter((p) => p.hasCaseStudy);
