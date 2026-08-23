import type { Experience } from "./types";

/**
 * Bullets are migrated verbatim from the previous site. Every metric here
 * ($100K/year, 10K+ companies, 100% pass rate, 60+ / 100+ students) came from
 * that source - none are invented. Do not add a number that is not already here.
 *
 * Confidentiality: the Adex entries describe client work. Naming the client, or
 * publishing internal architecture beyond what is already public on the previous
 * site, requires explicit clearance.
 */
export const experience: readonly Experience[] = [
  {
    slug: "adex-international",
    role: "Associate AI/ML Engineer",
    organization: "Adex International",
    period: "June 2025 – Present",
    startedAt: "2025-06-01",
    endedAt: null,
    logoUrl: "/logos/adex-international.png",
    highlights: [
      "Built a predictive, explainable churn-prevention platform for a managed service provider client (10K+ client companies) that saved the client over $100K/year by catching churn early — 45 engineered features from Presto/Iceberg data, per-customer SHAP explainability, and DoWhy causal inference to recommend retention interventions, served via an Auth0-secured dashboard",
      "Built a healthcare RAG system for doctors and patients: deployed MedGemma on SageMaker with Bedrock Knowledge Bases using query decomposition and reranking to cut missed and hallucinated details, with dual response personas for clinical and plain-language audiences, validated with practicing physicians",
      "Shipped an OCR pipeline preserving multi-column layout by combining layout analysis, OCR, and a vision-language model for post-processing, reconstructing documents with correct structure and reading order",
      "Built an internal AWS cost-tracking dashboard over Athena queries against terabytes of CloudTrail logs, grouping resources by project, department, and compliance tags to cut wasted AWS spend and give finance a clear cost-allocation view",
      "Built RAG chatbots for client website landing pages, answering visitor Q&A with latency-focused prompt engineering and NeMo Guardrails to block jailbreak attempts",
    ],
    technologies: [
      "AWS SageMaker",
      "Bedrock",
      "Presto",
      "SHAP",
      "DoWhy",
      "NeMo Guardrails",
    ],
  },
  {
    slug: "tekbay-academy",
    role: "AWS Machine Learning Trainer",
    organization: "TekBay Academy",
    period: "June 2025 – Present",
    startedAt: "2025-06-01",
    endedAt: null,
    logoUrl: "/logos/tekbay-academy.png",
    highlights: [
      "Designed a complete 3-month curriculum for AWS Certified ML Engineer (MLA-C01) from scratch — all exam domains, 8 mock exam sets, hands-on labs, and capstone projects — as a reusable asset for every new batch",
      "Taught 60+ students in person across 2 physical batches, turning them into certified AWS ML Engineers, including a 100% pass rate in the first batch",
      "Recorded a full studio-quality lecture series, turning a one-time recording into a course the academy can keep selling — now guiding 100+ remote students across India and Nepal through their ML journey",
      "Introduced a scenario-based teaching approach: walking through a real problem first and then showing how the concept solves it, instead of reading off slides, to keep beginners engaged",
    ],
    technologies: ["AWS", "SageMaker", "MLOps", "Curriculum design"],
  },
  {
    slug: "fusemachines",
    role: "AI Fellowship",
    organization: "Fusemachines",
    period: "March 2024 – October 2024",
    startedAt: "2024-03-01",
    endedAt: "2024-10-31",
    logoUrl: "/logos/fusemachines.png",
    highlights: [
      "Completed a fully-funded, industry-focused AI Fellowship building ML systems across computer vision, NLP, and LLMs, with emphasis on model evaluation, training workflows, and MLOps for real-world deployment",
      "Engineered an industry-grade Computer Vision and AI for Governance project, applying deep learning models to public-sector and compliance problems; separately built NLP models for sentiment analysis and text classification using transformer-based architectures",
      "Completed intensive training in Supervised and Unsupervised Learning, Deep Neural Networks, and Deep Generative Models, with structured research-paper reading sessions",
    ],
    technologies: ["PyTorch", "Transformers", "Computer Vision", "NLP"],
  },
];
