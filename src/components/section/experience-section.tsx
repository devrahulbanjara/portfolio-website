"use client";

import AccordionChevron from "@/components/accordion-chevron";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { initialsOf } from "@/lib/utils";
import { experience } from "@/lib/content";

/**
 * Roles collapse by default so the homepage stays scannable; the full
 * accomplishment bullets are one click away.
 *
 * Trigger styling is upstream's: no row borders, `grid gap-6` spacing, Radix's
 * built-in chevron hidden via `[&>svg]:hidden`, and AccordionChevron in its
 * place. `group` on the trigger is what the chevron's hover and open states hang
 * off, so it must stay.
 */
export default function ExperienceSection() {
  return (
    <Accordion type="single" collapsible className="grid w-full gap-6">
      {experience.map((role) => (
        <AccordionItem
          key={role.slug}
          value={role.slug}
          className="grid w-full gap-2 border-b-0"
        >
          <AccordionTrigger className="group cursor-pointer rounded-none p-0 transition-colors hover:no-underline [&>svg]:hidden">
            <div className="flex w-full items-center justify-between gap-x-3 text-left">
              <div className="flex min-w-0 flex-1 items-center gap-x-3">
                <Logo
                  src={role.logoUrl}
                  alt={role.organization}
                  fallback={initialsOf(role.organization)}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2 font-semibold leading-none">
                    {role.organization}
                    <AccordionChevron />
                  </div>
                  <div className="font-sans text-sm text-muted-foreground">
                    {role.role}
                  </div>
                </div>
              </div>
              <div className="flex flex-none items-center gap-1 text-right text-xs tabular-nums text-muted-foreground">
                <span>{role.period}</span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="ml-13 p-0">
            <div className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2.5">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-4 text-xs leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-muted-foreground/50 sm:text-sm"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5">
                {role.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="px-2 py-0 text-[10px]"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
