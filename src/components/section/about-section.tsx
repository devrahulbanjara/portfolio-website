import Link from "next/link";

/** Inline link styling, matching the upstream template's underlined prose links. */
const LINK =
  "font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground";

/**
 * Two sentences: what Rahul does now, then what he does around it. Anything
 * longer duplicates the sections directly below - the certifications have their
 * own section, the repos are in the dock, and the roles are in Experience - so
 * this paragraph only has to orient the reader, not list credentials.
 *
 * The links stay because they let a reader jump straight to the proof, and every
 * href resolves to a real page.
 */
export default function AboutSection() {
  return (
    <p className="text-pretty font-sans leading-relaxed text-muted-foreground">
      I&apos;m a{" "}
      <Link href="#experience" className={LINK}>
        Junior AI/ML Engineer at Adex International
      </Link>
      , where I build AI systems end to end — a churn-prevention platform an
      enterprise runs on daily, a clinical retrieval system checked by
      practising physicians, and document pipelines that hold up against messy
      real-world input. Alongside that I teach the AWS Machine Learning Engineer
      certification at TekBay Academy, build things like{" "}
      <Link href="/work/nirantar" className={LINK}>
        Nirantar
      </Link>{" "}
      and{" "}
      <Link href="/work/convexhire" className={LINK}>
        ConvexHire
      </Link>{" "}
      in my own time, and write about all of it{" "}
      <Link href="/blogs" className={LINK}>
        here
      </Link>
      .
    </p>
  );
}
