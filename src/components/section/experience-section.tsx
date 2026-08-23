"use client";

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
 * Roles collapse by default so the homepage stays scannable. The full
 * accomplishment bullets are one click away rather than forcing every visitor
 * to read a resume.
 */
export default function ExperienceSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {experience.map((role) => (
        <AccordionItem
          key={role.slug}
          value={role.slug}
          className="border-b border-border/50 last:border-0"
        >
          <AccordionTrigger className="py-3 hover:no-underline [&>svg]:text-muted-foreground">
            <div className="flex flex-1 items-center gap-3 text-left">
              <Logo
                src={role.logoUrl}
                alt={role.organization}
                fallback={initialsOf(role.organization)}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-semibold leading-none">
                  {role.organization}
                </span>
                <span className="font-sans text-sm text-muted-foreground">
                  {role.role}
                </span>
              </div>
              <span className="flex-none pr-2 text-xs tabular-nums text-muted-foreground">
                {role.period}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-6">
            <div className="flex flex-col gap-4 pl-[3.25rem]">
              <ul className="flex flex-col gap-2.5">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-muted-foreground/50"
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
