import type { Activity, Certification, Education } from "./types";

export const certifications: readonly Certification[] = [
  {
    slug: "aws-mla-c01",
    name: "AWS Certified Machine Learning – Associate",
    issuer: "Amazon Web Services",
    date: "2025",
    issuerLogoUrl: "/logos/aws.svg",
    credentialId: "035ddb7ca35541e0a815a122d7afcb84",
    verificationUrl:
      "https://cp.certmetrics.com/amazon/en/public/verify/credential/035ddb7ca35541e0a815a122d7afcb84",
    badgeUrl:
      "https://www.credly.com/badges/da4ccfc4-9ce1-45a7-8433-ef8b60fc68bc/linked_in?t=t1zkgo",
  },
  {
    slug: "nvidia-genai-llms",
    name: "NVIDIA-Certified Associate: Generative AI LLMs",
    issuer: "NVIDIA",
    date: "2026",
    issuerLogoUrl: "/logos/nvidia.png",
    verificationUrl:
      "https://www.credly.com/badges/e8836994-77e6-4762-835b-17ae8a79adda/linked_in_profile",
  },
  {
    slug: "fusemachines-microdegree",
    name: "Microdegree™ in Artificial Intelligence",
    issuer: "Fusemachines",
    date: "2024",
    issuerLogoUrl: "/logos/fusemachines.png",
    verificationUrl:
      "https://s3.amazonaws.com/fuseclassroom-resources-prod/student-certificates/Microdegree%E2%84%A2+in+Artificial+Intelligence-RAHUL+DEV+BANJARA.pdf",
  },
];

export const education: readonly Education[] = [
  {
    slug: "herald-college-kathmandu",
    degree: "B.(Hons) in Computer Science",
    institution: "Herald College Kathmandu",
    period: "2023 – 2026",
    logoUrl: "/logos/herald-college.png",
    highlights: [
      "Modules: AI and Machine Learning, High Performance Computing, Software Engineering, Object-Oriented Programming, Human Computer Interaction, Computer System Architecture",
      "Coursework projects: Garbage Classification (CNNs), Sarcasm Headline Detection (LSTMs, Word2Vec, ablation studies), Telecom Churn Prediction with DiCE counterfactual explanations, GPU-accelerated computing with CUDA, Banking System (Java OOP)",
    ],
  },
];

export const activities: readonly Activity[] = [
  {
    slug: "devcorps-ai-learners",
    role: "Leader",
    organization: "DevCorps AI Learners Community",
    period: "2024 – 2026",
    logoUrl: "/logos/devcorps-ailearners.png",
    highlights: [
      "Led a 15-person team directly — deciding which events to run, handling event management end-to-end, and driving sponsor and brand collaborations to fund them; organized Showcase Fusion, a final-year project showcase drawing 500+ participants, plus multiple events across a month-long college-wide clubs competition",
      "Taught hands-on workshops (Agentic AI, Data Analysis, Machine Learning, LLMs & Prompt Engineering, and NLP to Generative AI) to 100+ students per session while still a student — the same teaching instinct now brought to TekBay Academy",
    ],
  },
];
