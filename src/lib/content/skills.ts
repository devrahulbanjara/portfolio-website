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
