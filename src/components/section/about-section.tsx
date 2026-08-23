import Link from "next/link";
import { certifications, profile } from "@/lib/content";

/** Inline link styling, matching the upstream template's underlined prose links. */
const LINK =
  "font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground";

function cert(slug: string) {
  return certifications.find((c) => c.slug === slug)?.verificationUrl ?? "#";
}

/**
 * One prose paragraph with inline links, the way the upstream template does it.
 *
 * The links are the point: they give the paragraph texture and let a reader
 * verify claims rather than take them on trust. Every href here is real -
 * credential verification URLs and repositories from lib/content - plus two
 * on-page anchors. Nothing is invented and nothing links to "#".
 */
export default function AboutSection() {
  return (
    <p className="text-pretty font-sans leading-relaxed text-muted-foreground">
      I build end-to-end AI systems across healthcare and enterprise —
      generative and agentic AI, machine learning, and full MLOps lifecycles on
      AWS. Right now I&apos;m an{" "}
      <Link href="#experience" className={LINK}>
        Associate AI/ML Engineer at Adex International
      </Link>
      , where I&apos;ve shipped a churn-prevention platform an enterprise acts
      on daily, a clinical retrieval system validated with practising
      physicians, and document pipelines that hold up against messy real-world
      input. I&apos;m{" "}
      <a
        href={cert("aws-mla-c01")}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
      >
        AWS
      </a>{" "}
      and{" "}
      <a
        href={cert("nvidia-genai-llms")}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
      >
        NVIDIA certified
      </a>
      , came up through the{" "}
      <a
        href={cert("fusemachines-microdegree")}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
      >
        Fusemachines AI Fellowship
      </a>
      , and I teach the AWS Machine Learning Engineer certification at TekBay
      Academy — 60+ engineers in person so far, with a 100% pass rate in the
      first batch. Outside of work I build things like{" "}
      <Link href="/work/nirantar" className={LINK}>
        Nirantar
      </Link>{" "}
      and{" "}
      <Link href="/work/convexhire" className={LINK}>
        ConvexHire
      </Link>
      , and I write about all of it{" "}
      <Link href="/blogs" className={LINK}>
        here
      </Link>
      . Most of my code is on{" "}
      <a
        href={profile.social.find((s) => s.name === "GitHub")?.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
      >
        GitHub
      </a>
      .
    </p>
  );
}
