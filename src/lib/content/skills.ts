import type { TechSlug } from "@/components/tech-icon";

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
  { name: "NestJS", slug: "nestjs" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Redis", slug: "redis" },
  { name: "Qdrant", slug: "qdrant" },
  { name: "Neo4j", slug: "neo4j" },
];
