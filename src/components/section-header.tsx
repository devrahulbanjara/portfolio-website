/**
 * The upstream template's centred section header: hairline rules fading in from
 * both edges, a dark pill straddling them, then a large heading and a balanced
 * subtitle.
 *
 * Extracted because three sections use it verbatim (Projects, Certifications,
 * Education & Community) and the gradient rule classes are too fiddly to keep
 * duplicating - `from-5%` / `via-95%` are what stop the line touching the pill.
 *
 * Sections that use this header are rendered WITHOUT a `title` in page.tsx;
 * otherwise the page shows a left-aligned `h2` above this one.
 *
 * The subtitle is OPTIONAL and the default is to omit it. A subtitle that only
 * paraphrases the rows underneath is padding, and worse, it reads as boasting.
 * Pass one only when it tells the reader something the section itself cannot.
 */
export default function SectionHeader({
  pill,
  heading,
  children,
}: {
  /** Short label for the pill, e.g. "My Projects". */
  pill: string;
  heading: string;
  /** Optional subtitle prose. Omit unless it earns its place. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <div className="flex w-full items-center">
        <div className="h-px flex-1 bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
        <div className="border bg-primary z-10 rounded-xl px-4 py-1">
          <span className="text-background text-sm font-medium">{pill}</span>
        </div>
        <div className="h-px flex-1 bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
      </div>
      <div className="flex flex-col items-center justify-center gap-y-3">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          {heading}
        </h2>
        {children ? (
          <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
            {children}
          </p>
        ) : null}
      </div>
    </div>
  );
}
