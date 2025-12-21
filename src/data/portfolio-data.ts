export const personalInfo = {
    name: "Rahul Dev Banjara",
    role: "Machine Learning Engineer & AI Educator",
    bio: [
        "I work across the full machine learning lifecycle on AWS, building production-grade ML systems with strong MLOps practices, cloud best principles, and real-world reliability.", "I’m particularly interested in core machine learning research and agentic AI, with growing focus on system design and software architecture, and I also teach and mentor students for the AWS Machine Learning Engineer – Associate (MLA-C01) certification.",
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
    "Python",
    "FastAPI",
    "LangChain",
    "LangGraph",
    "RAG",
    "AWS",
    "Docker",
    "HuggingFace",
    "MLflow",
    "TensorFlow",
    "PyTorch",
    "YOLO",
    "Git",
    "CI/CD",
    "Vector Databases",
    "SQLAlchemy",
    "Neo4j",
    "Finetuning",
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
        company: "TekBay Digital",
        duration: "June 2025 – Present",
        description: [
            "Built an Agentic GraphRAG pipeline for data ingestion and inference over medical datasets using FastAPI",
            "Developed an Arabic OCR system preserving document layout with layout analysis and vision-language models",
            "Created document verification and fraud detection pipeline using AWS Textract, Bedrock, and SageMaker Pipelines",
            "Designed cost-efficient Athena queries for terabytes of AWS logs stored in S3",
            "Worked on multiple vanilla RAG-based chatbot projects for internal and client use cases",
        ],
    },
    {
        id: 2,
        title: "AWS Machine Learning Trainer",
        company: "TekBay Academy",
        duration: "November 2025 – Present",
        description: [
            "Designed complete 3-month curriculum for AWS Certified ML Engineer (MLA-C01) with practice exams",
            "Created intuitive presentations and study resources with visual explanations",
            "Designed and conducted hands-on labs using Amazon SageMaker and AWS ML services",
            "Supervised capstone projects with guidance on MLOps practices and deployment strategies",
            "Actively teach 20+ students per batch with continuous mentoring",
        ],
    },
    {
        id: 3,
        title: "AI Fellowship 2025",
        company: "Fusemachines",
        duration: "March 2024 – October 2024",
        description: [
            "Engineered industry-grade Computer Vision and AI for Governance project with state-of-the-art models",
            "Gained hands-on experience across entire ML lifecycle from data collection to deployment",
            "Worked on NLP assignments using transformer-based architectures and modern embeddings",
            "Participated in research paper reading sessions and AI advancement discussions",
            "Completed intensive training in Supervised/Unsupervised Learning and Deep Generative Models",
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
        title: "Recruitment Automation & Job Marketplace Platform",
        description: "Multi-agent recruitment automation system using LangGraph for the complete hiring lifecycle",
        details: [
            "Designing multi-agent system with LangGraph for job posting to onboarding automation",
            "Implementing LLM-powered job descriptions and semantic resume screening with bias reduction",
            "Building explainable candidate-ranking dashboards for recruiters",
            "Automating interview scheduling, offer letters, and HR approval workflows",
            "Extending with Agentic GraphRAG-based candidate knowledge base",
        ],
        tags: ["LangGraph", "LLM", "GraphRAG", "FastAPI"],
        githubUrl: "https://github.com/devrahulbanjara/ConvexHire",
        featured: true,
        inProgress: true,
    },
    {
        id: 2,
        title: "AI Software Engineer (CLI Tool)",
        description: "CLI-based AI software engineer generating complete systems including frontend, backend, and database",
        details: [
            "Built CLI tool capable of generating complete systems with frontend, backend, and DB schemas",
            "Utilized advanced agentic concepts: subgraphs, guardrails, human-in-the-loop workflows",
            "Implemented secure filesystem operations and structured output generation",
        ],
        tags: ["Agentic AI", "CLI", "Python"],
        githubUrl: "https://github.com/devrahulbanjara/Knit.dev",
        featured: true,
        inProgress: true,
    },
    {
        id: 3,
        title: "Complete MLOps Fraud Detection System",
        description: "End-to-end MLOps pipeline on Amazon SageMaker for credit card fraud detection",
        details: [
            "Implemented E2E MLOps pipeline with SageMaker for credit card fraud detection",
            "Configured EventBridge for automated 10-day retraining cycles",
            "Set up Model Quality and Data Quality Monitors with governance model cards",
            "Automated model registration and deployment based on evaluation thresholds",
            "Implemented CloudWatch alarms and SNS alerts for data drift detection",
        ],
        tags: ["SageMaker", "MLOps", "AWS", "EventBridge"],
        featured: true,
        inProgress: false,
    },
    {
        id: 4,
        title: "Nepali Document Verification System",
        description: "System to verify authenticity of Nepali government documents with 82% accuracy",
        details: [
            "Created synthetic dataset using templates and Python with dynamic augmentation",
            "Used ResNet50 for classification and YOLOv8 for localized feature detection",
            "Applied EasyOCR and PaddleOCR for Nepali and English text extraction",
            "Verified authenticity using Levenshtein distance with 90% similarity threshold",
            "Built Streamlit interface achieving 82% overall verification accuracy",
        ],
        tags: ["Computer Vision", "OCR", "YOLOv8", "Streamlit"],
        githubUrl: "https://github.com/devrahulbanjara/Document-Verification-System",
        featured: false,
        inProgress: false,
    },
    {
        id: 5,
        title: "Personalized RAG Chatbot",
        description: "AI chatbot with RAG and Llama 3.1 deployed under $4/month on AWS Lightsail",
        details: [
            "Built RAG chatbot with Llama 3.1 (8B) for context-aware document responses",
            "Developed async FastAPI backend with ChromaDB and session-based memory",
            "Leveraged Groq LPU for low-latency inference with Streamlit knowledge base management",
            "Deployed on AWS Lightsail with Nginx reverse proxy under $4/month",
        ],
        tags: ["RAG", "Llama", "FastAPI", "ChromaDB"],
        githubUrl: "https://github.com/devrahulbanjara/personalized-chatbot",
        featured: false,
        inProgress: false,
    },
    {
        id: 6,
        title: "AarthikNiti – AI-Powered Personal Finance Management Tool",
        description: "AI-driven personal finance management tool for expense tracking and savings recommendations",
        details: [
            "Built AI-driven features for automated expense categorization, spending trend analysis, and personalized savings recommendations",
            "Implemented OCR-based receipt scanning to extract financial data accurately and efficiently",
            "Designed analytics modules for financial health scoring, budget tracking, and detailed category-wise insights",
            "Delivered interactive and explainable visualizations for income versus expense trends, with secure user authentication",
        ],
        tags: ["AI", "Finance", "OCR", "Analytics"],
        url: "https://aarthik-niti-expense-tracker.vercel.app/",
        featured: false,
        inProgress: false,
    },
    {
        id: 7,
        title: "DeepSeek R1 Distill Llama 8B – LoRA Fine-Tuned Medical Model",
        description: "Medical model fine-tuned on DeepSeek R1 Distill Llama 8B using LoRA adapters",
        details: [
            "Fine-tuned DeepSeek R1 Distill Llama 8B on medical consultation data using LoRA adapters for efficient parameter tuning",
            "Optimized training with Unsloth and 4-bit quantization to run on limited hardware resources",
            "Developed an inference system capable of handling complex, domain-specific medical queries",
            "Integrated Weights & Biases for experiment tracking and deployed adapter weights to the Hugging Face Hub for easy reuse",
        ],
        tags: ["DeepSeek", "LoRA", "Fine-tuning", "Medical AI", "Unsloth"],
        githubUrl: "https://github.com/devrahulbanjara/DeepSeek-Finetuned-with-LoRA-on-Medical-Dataset",
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
            "AI and Machine Learning coursework",
            "Object-Oriented Programming, Software Engineering",
            "High Performance Computing, Human Computer Interaction",
            "Computer System Architecture",
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
        contributions: [
            "Conducted hands-on session on NumPy, Pandas, and Data Analysis for 70+ students",
            "Led workshop on LLMs and Prompt Engineering covering zero-shot, few-shot, and chain-of-thought",
            "Delivered NLP to Generative AI workshop with practical LangChain chatbot training",
            "Presented at Showcase Fusion featuring CV, Unity, and e-commerce projects",
            "Cultivated supportive, peer-driven learning environment within the AI community",
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
        name: "AWS Certified Machine Learning Engineer – Associate (MLA-C01)",
        issuer: "Amazon Web Services",
        date: "2025",
        credentialId: "035ddb7ca35541e0a815a122d7afcb84",
        verificationUrl: "https://cp.certmetrics.com/amazon/en/public/verify/credential/035ddb7ca35541e0a815a122d7afcb84",
        badgeUrl: "https://www.credly.com/badges/da4ccfc4-9ce1-45a7-8433-ef8b60fc68bc/linked_in?t=t1zkgo",
    },
    {
        id: 2,
        name: "Microdegree™ in Artificial Intelligence",
        issuer: "Fusemachines",
        date: "2024",
        verificationUrl: "https://s3.amazonaws.com/fuseclassroom-resources-prod/student-certificates/Microdegree%E2%84%A2+in+Artificial+Intelligence-RAHUL+DEV+BANJARA.pdf",
    },
]
