export const personalInfo = {
    name: "Rahul Dev Banjara",
    role: "AWS and NVIDIA Certified ML & Gen AI Engineer",
    bio: [
        "I build end-to-end AI systems across healthcare and enterprise — generative and agentic AI (RAG, multi-agent orchestration), backend and software engineering, and full MLOps lifecycles on AWS.",
        "I'm also a certified trainer at TekBay Academy, teaching the next wave of ML engineers toward the AWS Machine Learning Engineer – Associate (MLA-C01) certification.",
    ],
    currentWork: "ConvexHire",
    profileImage: "/my_pic.jpg",
    email: "rdbanjara07@gmail.com",
    phone: "+977-9866121812",
    portfolio: "https://rahuldevbanjara.com.np",
}

export interface NavLink {
    label: string
    url: string
    external?: boolean
}

export const navLinks: NavLink[] = [
    { label: "LinkedIn", url: "https://linkedin.com/in/devrahulbanjara", external: true },
    { label: "Github", url: "https://github.com/devrahulbanjara", external: true },
]

export const skills: string[] = [
    "RAG",
    "LangGraph",
    "Multi-Agent Workflows",
    "MCP Servers",
    "Prompt Engineering",
    "Guardrails",
    "Fine-tuning",
    "AWS Bedrock",
    "LangChain",
    "OpenAI",
    "Hugging Face",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "TensorFlow",
    "Computer Vision",
    "NLP",
    "Transformers",
    "scikit-learn",
    "XGBoost",
    "SHAP",
    "Causal Inference (DoWhy)",
    "AWS (SageMaker, Lambda, Textract, Athena, S3)",
    "Docker",
    "MLflow",
    "CI/CD",
    "Model Registry",
    "FastAPI",
    "PostgreSQL",
    "SQLAlchemy",
    "Redis",
    "Apache Airflow",
    "Qdrant",
    "Neo4j",
    "Presto",
    "Python",
    "JavaScript",
    "SQL",
    "Java",
]

export interface WorkExperience {
    id: number
    title: string
    company: string
    duration: string
    description: string[]
}

export const workExperience: WorkExperience[] = [
    {
        id: 1,
        title: "Associate AI/ML Engineer",
        company: "Adex International",
        duration: "June 2025 – Present",
        description: [
            "Built my biggest project at Adex: a predictive, explainable churn-prevention platform for a managed service provider client (10K+ client companies) that saved the client over $100K/year by catching churn early — 45 engineered features from Presto/Iceberg data, per-customer SHAP explainability, and DoWhy causal inference to recommend retention interventions, served via an Auth0-secured dashboard",
            "Built a healthcare RAG system for doctors and patients: deployed MedGemma on SageMaker with Bedrock Knowledge Bases using query decomposition and reranking to cut missed and hallucinated details, with dual response personas for clinical and plain-language audiences, validated with practicing physicians",
            "Built RAG chatbots for client website landing pages, answering visitor Q&A with latency-focused prompt engineering and NeMo Guardrails to block jailbreak attempts",
            "Shipped an OCR pipeline preserving multi-column layout by combining layout analysis, OCR, and a vision-language model for post-processing, reconstructing documents with correct structure and reading order",
            "Built an internal AWS cost-tracking dashboard over Athena queries against terabytes of CloudTrail logs, grouping resources by project, department, and compliance tags to cut wasted AWS spend and give finance a clear cost-allocation view",
        ],
    },
    {
        id: 2,
        title: "AWS Machine Learning Trainer",
        company: "TekBay Academy",
        duration: "June 2025 – Present",
        description: [
            "Designed a complete 3-month curriculum for AWS Certified ML Engineer (MLA-C01) from scratch — all exam domains, 8 mock exam sets, hands-on labs, and capstone projects — as a reusable asset for every new batch",
            "Introduced a scenario-based teaching approach: walking through a real problem first and then showing how the concept solves it, instead of reading off slides, to keep beginners engaged",
            "Recorded a full studio-quality lecture series, turning a one-time recording into a course the academy can keep selling — now guiding 100+ remote students across India and Nepal through their ML journey",
            "Taught 60+ students in person across 2 physical batches, turning them into certified AWS ML Engineers, including a 100% pass rate in the first batch",
        ],
    },
    {
        id: 3,
        title: "AI Fellowship (Internship/Traineeship)",
        company: "Fusemachines",
        duration: "March 2024 – October 2024",
        description: [
            "Completed a fully-funded, industry-focused AI Fellowship building ML systems across computer vision, NLP, and LLMs, with emphasis on model evaluation, training workflows, and MLOps for real-world deployment",
            "Engineered an industry-grade Computer Vision and AI for Governance project, applying deep learning models to public-sector and compliance problems; separately built NLP models for sentiment analysis and text classification using transformer-based architectures",
            "Completed intensive training in Supervised and Unsupervised Learning, Deep Neural Networks, and Deep Generative Models, with structured research-paper reading sessions",
        ],
    },
]

export interface Project {
    id: number
    title: string
    description: string
    details: string[]
    tags: string[]
    url?: string
    githubUrl?: string
    featured: boolean
    inProgress?: boolean
}

export const projects: Project[] = [
    {
        id: 1,
        title: "Nirantar – Health Tracking PWA with MCP AI Integration",
        description:
            "A full-stack, installable PWA with a multi-tenant MCP server that lets AI assistants like Claude reason over your own health data",
        details: [
            "Built a full-stack installable PWA with a multi-tenant MCP server exposing scoped tools, so MCP clients like Claude decide exactly which data they need to answer each question",
            "Implemented OAuth authentication (Clerk) with per-user data scoping, so every connected assistant sees only that user's own data, with zero manual credential entry during setup",
            "Deployed and remotely hosted both the web app and the MCP endpoint on a custom domain, integrated through Claude Desktop's connector system, turning Claude into a personalized assistant that reasons over the user's own historical data",
        ],
        tags: ["MCP", "PWA", "FastAPI", "OAuth"],
        githubUrl: "https://github.com/devrahulbanjara/nirantar",
        featured: true,
        inProgress: false,
    },
    {
        id: 2,
        title: "ConvexHire – AI-Powered Hiring Platform",
        description:
            "A multi-agent recruitment platform that cuts LLM cost, speeds up shortlisting, and keeps hiring decisions fair",
        details: [
            "Cut LLM inference cost roughly 80% by routing candidates through a lightweight ML classifier that filters out unfit applicants before any expensive LLM token is spent",
            "Orchestrated a multi-agent shortlisting pipeline (parallel CTO/HR persona nodes, critique-judge with early-exit, model-tier splitting) that reaches a decision in minutes instead of hours, with prompt caching and an intent router keeping per-query LLM cost low",
            "Built a recruiter chatbot with a full custom tool suite so recruiters can run the platform through conversation, plus a job-creation multi-agent drafting complete postings from a few keywords and past job references, skipping manual form-filling",
            "Built a hybrid job-search engine blending keyword and semantic search with RRF reranking, so the right candidates surface whether or not they used the exact words in the job description",
            "Engineered fairness and compliance safeguards: PII redaction against identity-based bias, NVIDIA NeMo Guardrails against prompt injection, and human-in-the-loop confirmation on every agent-proposed decision",
        ],
        tags: ["LangGraph", "Multi-Agent", "FastAPI", "RAG"],
        githubUrl: "https://github.com/devrahulbanjara/ConvexHire",
        featured: true,
        inProgress: false,
    },
    {
        id: 3,
        title: "Insurance Claim Fraud Detection – End-to-End AWS MLOps Pipeline",
        description:
            "A personal, ingest-to-deployment AWS MLOps pipeline for insurance claim fraud detection, from feature engineering through drift detection",
        details: [
            "Built a full ingest-to-deployment AWS MLOps pipeline for insurance claim fraud detection: SageMaker Feature Store for engineered features, SMOTE-balanced training, and XGBoost tuned via SageMaker Automatic Model Tuning, orchestrated end-to-end as a single SageMaker Pipeline",
            "Registered every model in SageMaker Model Registry with attached metrics and bias reports behind a manual approval gate, deployed to a real-time endpoint, and wired a CI/CD pipeline that redeploys the latest approved model on every push",
            "Implemented drift detection on live traffic (SageMaker Data Capture + Evidently) against the training baseline, CloudFormation-managed autoscaling, and CloudWatch dashboards for latency, errors, and cost",
            "When AWS restricted SageMaker Clarify access on new accounts, hand-implemented the underlying bias metrics and SHAP explainability directly against the trained model",
        ],
        tags: ["SageMaker", "MLOps", "AWS", "XGBoost"],
        featured: true,
        inProgress: false,
    },
    {
        id: 4,
        title: "Nepali ASR – Fine-tuned Whisper Small for Devanagari Nepali",
        description:
            "A fine-tuned Whisper Small model bringing reliable Devanagari Nepali speech recognition where off-the-shelf APIs fall short",
        details: [
            "Fine-tuned OpenAI's Whisper Small on a Nepali speech corpus, dropping WER from 130.80% to 31.64% and CER from 66.24% to 7.27% on the held-out evaluation split",
            "Built the full training pipeline in Hugging Face Transformers and datasets: audio resampling, log-mel feature extraction, Devanagari tokenizer setup, and mixed-precision training",
            "Deployed the fine-tuned model to Hugging Face Hub and Spaces for public inference, filling a gap where reliable Devanagari Nepali ASR is otherwise unavailable from off-the-shelf APIs",
        ],
        tags: ["Whisper", "ASR", "Hugging Face", "Fine-tuning"],
        url: "https://huggingface.co/devrahulbanjara/whisper-small-nepali",
        featured: false,
        inProgress: false,
    },
]

export interface Education {
    id: number
    degree: string
    institution: string
    duration: string
    highlights: string[]
}

export const education: Education[] = [
    {
        id: 1,
        degree: "B.(Hons) in Computer Science",
        institution: "Herald College Kathmandu",
        duration: "2023 – 2026",
        highlights: [
            "Modules: AI and Machine Learning, High Performance Computing, Software Engineering, Object-Oriented Programming, Human Computer Interaction, Computer System Architecture",
            "Coursework Projects: Garbage Classification (CNNs), Sarcasm Headline Detection (LSTMs, Word2Vec, ablation studies), Telecom Churn Prediction with DiCE Counterfactual Explanations, GPU-Accelerated Computing with CUDA, Banking System (Java OOP)",
        ],
    },
]

export interface Activity {
    id: number
    role: string
    organization: string
    duration?: string
    contributions: string[]
}

export const activities: Activity[] = [
    {
        id: 1,
        role: "Leader",
        organization: "DevCorps AI Learners Community, Herald College Kathmandu",
        duration: "2024 – 2026",
        contributions: [
            "Led a 15-person team directly — deciding which events to run, handling event management end-to-end, and driving sponsor and brand collaborations to fund them; organized Showcase Fusion, a final-year project showcase drawing 500+ participants, plus multiple events across a month-long college-wide clubs competition",
            "Taught multiple hands-on workshops (Agentic AI, Data Analysis, Machine Learning, LLMs & Prompt Engineering, and NLP to Generative AI) to 100+ students per session while still a student myself — the same teaching instinct now brought to TekBay Academy",
        ],
    },
]

export interface Certification {
    id: number
    name: string
    issuer: string
    date: string
    credentialId?: string
    verificationUrl: string
    badgeUrl?: string
}

export const certifications: Certification[] = [
    {
        id: 1,
        name: "AWS Certified Machine Learning – Associate (MLA-C01)",
        issuer: "Amazon Web Services",
        date: "2025",
        credentialId: "035ddb7ca35541e0a815a122d7afcb84",
        verificationUrl:
            "https://cp.certmetrics.com/amazon/en/public/verify/credential/035ddb7ca35541e0a815a122d7afcb84",
        badgeUrl:
            "https://www.credly.com/badges/da4ccfc4-9ce1-45a7-8433-ef8b60fc68bc/linked_in?t=t1zkgo",
    },
    {
        id: 2,
        name: "NVIDIA-Certified Associate: Generative AI LLMs",
        issuer: "NVIDIA",
        date: "2026",
        verificationUrl:
            "https://www.credly.com/badges/e8836994-77e6-4762-835b-17ae8a79adda/linked_in_profile",
    },
    {
        id: 3,
        name: "Microdegree™ in Artificial Intelligence",
        issuer: "Fusemachines",
        date: "2024",
        verificationUrl:
            "https://s3.amazonaws.com/fuseclassroom-resources-prod/student-certificates/Microdegree%E2%84%A2+in+Artificial+Intelligence-RAHUL+DEV+BANJARA.pdf",
    },
]
