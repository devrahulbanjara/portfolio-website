import { skillGroups } from "@/lib/content";

/**
 * Replaces the previous site's flat wall of 38 skill tags.
 *
 * Same technologies, but grouped into four capability areas with a line on what
 * each actually delivers. A reader should come away knowing what Rahul can
 * build, not which libraries he has imported.
 */
export default function WhatIBuildSection() {
  return (
    <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      {skillGroups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-brand">
            {group.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {group.summary}
          </p>
        </div>
      ))}
    </div>
  );
}
