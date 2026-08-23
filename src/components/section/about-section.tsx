import Link from "next/link";

const LINK =
  "font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground";

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
      certification at TekBay Academy, build{" "}
      <Link href="#projects" className={LINK}>
        useful projects
      </Link>{" "}
      for myself and also the world.
    </p>
  );
}
