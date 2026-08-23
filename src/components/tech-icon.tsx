/* eslint-disable @next/next/no-img-element -- the AWS mark is a local SVG file;
   next/image does not optimize vector formats. */
import { Langchain } from "@/components/ui/svgs/langchain";
import { Redis } from "@/components/ui/svgs/redis";
import {
  siApacheairflow,
  siDocker,
  siFastapi,
  siHuggingface,
  siMlflow,
  siNeo4j,
  siNestjs,
  siPostgresql,
  siPython,
  siPytorch,
  siQdrant,
  siTensorflow,
  siTypescript,
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
  typescript: siTypescript,
  huggingface: siHuggingface,
  fastapi: siFastapi,
  postgresql: siPostgresql,
  docker: siDocker,
  airflow: siApacheairflow,
  mlflow: siMlflow,
  neo4j: siNeo4j,
  nestjs: siNestjs,
  qdrant: siQdrant,
} as const;

export type TechSlug =
  keyof typeof SIMPLE | "aws" | "scikitlearn" | "langchain" | "redis";

export function TechIcon({
  slug,
  className = "size-4",
}: {
  slug: TechSlug;
  className?: string;
}) {
  // Wordmark logos: constrain HEIGHT and let width follow, or they squash.
  // AWS is ~3:1 and scikit-learn ~1.85:1, so neither fits a square slot.
  if (slug === "aws" || slug === "scikitlearn") {
    const file = slug === "aws" ? "aws.svg" : "scikit-learn.svg";
    return (
      <img
        src={`/logos/${file}`}
        alt=""
        aria-hidden
        className={`${className} w-auto`}
      />
    );
  }

  // Monochrome mark: takes the theme's foreground colour so it stays visible on
  // both grounds. A baked #000 would disappear in dark mode.
  if (slug === "langchain") {
    return <Langchain className={`${className} text-foreground`} aria-hidden />;
  }

  // Full-colour mark with its own fills; nothing to theme.
  if (slug === "redis") {
    return <Redis className={className} aria-hidden />;
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
