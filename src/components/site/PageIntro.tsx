import Link from "next/link";
import { Magnetic } from "./Magnetic";

/**
 * The opening of every inner page: a large plain-language title, an optional
 * line of context, and an optional round call-to-action sitting on a rule.
 */
export function PageIntro({
  title,
  lede,
  cta,
  children,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  cta?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="page-intro wrap">
      <h1 className="page-title" data-reveal>
        {title}
      </h1>
      {lede && (
        <p className="page-lede" data-reveal style={{ ["--d" as string]: 1 }}>
          {lede}
        </p>
      )}
      {children && (
        <div className="page-intro-extra" data-reveal style={{ ["--d" as string]: 2 }}>
          {children}
        </div>
      )}
      <div className="page-rule">
        {cta && (
          <Magnetic strength={0.4} className="page-rule-cta">
            <Link href={cta.href} className="circle-btn circle-btn-dark">
              <span>{cta.label}</span>
            </Link>
          </Magnetic>
        )}
      </div>
    </header>
  );
}

/** A labelled section with the label in the left column (used across inner pages). */
export function Section({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="section wrap" id={id}>
      <div className="section-grid">
        <h2 className="label section-label" data-reveal>
          {label}
        </h2>
        <div className="section-body">{children}</div>
      </div>
    </section>
  );
}
