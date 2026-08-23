import { Logo } from "@/components/logo";
import { initialsOf } from "@/lib/utils";
import { activities, education } from "@/lib/content";

/**
 * Education and community leadership share a section: both are "how Rahul
 * learned and taught", and neither warrants a full section of its own on the
 * homepage. Detail stays compact; the teaching story is carried by the TekBay
 * role in Experience.
 */
export default function EducationSection() {
  const entries = [
    ...education.map((e) => ({
      key: e.slug,
      logoUrl: e.logoUrl,
      title: e.institution,
      subtitle: e.degree,
      period: e.period,
      highlights: e.highlights,
    })),
    ...activities.map((a) => ({
      key: a.slug,
      logoUrl: a.logoUrl,
      title: a.organization,
      subtitle: a.role,
      period: a.period,
      highlights: a.highlights,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry) => (
        <div key={entry.key} className="flex gap-3">
          <Logo
            src={entry.logoUrl}
            alt={entry.title}
            fallback={initialsOf(entry.title)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold leading-none">{entry.title}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {entry.period}
              </span>
            </div>
            <span className="font-sans text-sm text-muted-foreground">
              {entry.subtitle}
            </span>
            <ul className="flex flex-col gap-1.5 pt-1">
              {entry.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="text-xs leading-relaxed text-muted-foreground/80"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
