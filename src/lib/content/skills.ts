import type { TechSlug } from "@/components/tech-icon";
import type { SkillGroup } from "./types";

/**
 * The previous site listed 38 skills as one flat wall of tags, which reads as an
 * inventory rather than a capability. These are the same 38 items regrouped into
 * four capability areas, each with a line on what it actually delivers.
 *
 * Technologies support the story; they are not the story. Keep this to four
 * groups - a fifth turns it back into an inventory.
 */
export const skillGroups: readonly SkillGroup[] = [
  {
    title: "Generative AI",
    summary:
      "Retrieval and agent systems that stay grounded, cheap, and hard to jailbreak.",
    items: [
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
      "Transformers",
    ],
  },
  {
    title: "Machine Learning",
    summary:
      "Predictive models that explain themselves, including why an outcome happened.",
    items: [
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "TensorFlow",
      "Computer Vision",
      "NLP",
      "scikit-learn",
      "XGBoost",
      "SHAP",
      "Causal Inference (DoWhy)",
    ],
  },
  {
    title: "ML Engineering",
    summary:
      "Training-to-production pipelines with registries, drift detection, and CI/CD.",
    items: [
      "AWS (SageMaker, Lambda, Textract, Athena, S3)",
      "Docker",
      "MLflow",
      "CI/CD",
      "Model Registry",
      "Apache Airflow",
    ],
  },
  {
    title: "Software Systems",
    summary:
      "The APIs, data stores, and services the models actually run inside.",
    items: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "SQLAlchemy",
      "Redis",
      "Qdrant",
      "Neo4j",
      "Presto",
      "SQL",
      "JavaScript",
      "Java",
    ],
  },
];

/**
 * The headline stack, shown as icon pills.
 *
 * Deliberately curated, not all 38 skills: a wall of pills is the inventory
 * pattern the capability groups above exist to replace. Every entry here also
 * appears in a group above, so this is a visual index of the same truth - and
 * every one has a real brand icon, so nothing renders as a bare label.
 */
export const coreStack: readonly { name: string; slug: TechSlug }[] = [
  { name: "Python", slug: "python" },
  { name: "PyTorch", slug: "pytorch" },
  { name: "TensorFlow", slug: "tensorflow" },
  { name: "scikit-learn", slug: "scikitlearn" },
  { name: "Hugging Face", slug: "huggingface" },
  { name: "LangChain", slug: "langchain" },
  { name: "AWS", slug: "aws" },
  { name: "Docker", slug: "docker" },
  { name: "MLflow", slug: "mlflow" },
  { name: "Airflow", slug: "airflow" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Redis", slug: "redis" },
  { name: "Qdrant", slug: "qdrant" },
  { name: "Neo4j", slug: "neo4j" },
];
