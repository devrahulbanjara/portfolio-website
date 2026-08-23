"use client";

import AccordionChevron from "@/components/accordion-chevron";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/logo";
import SectionHeader from "@/components/section-header";
import { initialsOf } from "@/lib/utils";
import { activities, education } from "@/lib/content";

/**
 * Same collapsed-row pattern as Experience, for the same reason: the highlights
 * here run long, and printing every module and workshop on the homepage buries
 * everything below it.
 *
 * Education and community share one section, and both map onto the same row
 * shape, so they merge into a single list rather than two near-identical ones.
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
    <div className="flex flex-col gap-10">
      <SectionHeader pill="Education & Community Engagement" />

      <Accordion type="single" collapsible className="grid w-full gap-6">
        {entries.map((entry) => (
          <AccordionItem
            key={entry.key}
            value={entry.key}
            className="grid w-full gap-2 border-b-0"
          >
            <AccordionTrigger className="group cursor-pointer rounded-none p-0 transition-colors hover:no-underline [&>svg]:hidden">
              <div className="flex w-full items-center justify-between gap-x-3 text-left">
                <div className="flex min-w-0 flex-1 items-center gap-x-3">
                  <Logo
                    src={entry.logoUrl}
                    alt={entry.title}
                    fallback={initialsOf(entry.title)}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2 font-semibold leading-none">
                      {entry.title}
                      <AccordionChevron />
                    </div>
                    <div className="font-sans text-sm text-muted-foreground">
                      {entry.subtitle}
                    </div>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-1 text-right text-xs tabular-nums text-muted-foreground">
                  <span>{entry.period}</span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="ml-13 p-0">
              <ul className="flex flex-col gap-2.5">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-4 text-xs leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-muted-foreground/50 sm:text-sm"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
