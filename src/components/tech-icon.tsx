/* eslint-disable @next/next/no-img-element -- the AWS mark is a local SVG file;
   next/image does not optimize vector formats. */
import {
  siApacheairflow,
  siDocker,
  siFastapi,
  siHuggingface,
  siLangchain,
  siMlflow,
  siNeo4j,
  siPostgresql,
  siPython,
  siPytorch,
  siQdrant,
  siRedis,
  siScikitlearn,
  siTensorflow,
} from "simple-icons";

/**
 * Brand icons for the skills row.
 *
 * Sourced from `simple-icons`, which ships each logo's official path AND its
 * brand hex - the same pairing the shields.io badge catalogues use, but resolved
 * locally. Rendering via img.shields.io would mean one external request per
 * icon, slower paint, and a row that breaks offline.
 *
 * Imports are named rather than a namespace import so the bundler can tree-shake
 * the other ~3000 icons out.
 *
 * AWS, Java, and OpenAI were removed from simple-icons over trademark concerns.
 * AWS falls back to the real logo Rahul supplied in public/logos.
 */
const SIMPLE = {
  python: siPython,
  pytorch: siPytorch,
  tensorflow: siTensorflow,
  scikitlearn: siScikitlearn,
  huggingface: siHuggingface,
  langchain: siLangchain,
  fastapi: siFastapi,
  postgresql: siPostgresql,
  redis: siRedis,
  docker: siDocker,
  airflow: siApacheairflow,
  mlflow: siMlflow,
  neo4j: siNeo4j,
  qdrant: siQdrant,
} as const;

export type TechSlug = keyof typeof SIMPLE | "aws";

export function TechIcon({
  slug,
  className = "size-4",
}: {
  slug: TechSlug;
  className?: string;
}) {
  if (slug === "aws") {
    return (
      <img src="/logos/aws.svg" alt="" aria-hidden className={className} />
    );
  }

  const icon = SIMPLE[slug];

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      className={className}
      // Brand colour, fixed across themes. A Python logo that turns grey in
      // dark mode stops being recognizable as Python.
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
