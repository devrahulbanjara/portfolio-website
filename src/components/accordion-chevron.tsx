import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Upstream's affordance for a collapsed accordion row, copied because without it
 * nothing tells the reader the row is clickable at all.
 *
 * Two chevrons stacked in one fixed 3.5x3.5 box, cross-fading:
 *   - closed, hovered: ChevronRight fades in and slides right
 *   - open: ChevronRight vanishes, ChevronDown fades in rotated 180deg
 *
 * The box is `relative` with both icons `absolute` so swapping them never
 * reflows the title next to it. Requires an ancestor with `group` and Radix's
 * `data-state` on it - i.e. put this inside an AccordionTrigger marked `group`.
 */
export default function AccordionChevron() {
  return (
    <span className="relative inline-flex h-3.5 w-3.5 items-center">
      <ChevronRight
        className={cn(
          "absolute h-3.5 w-3.5 shrink-0 stroke-2 text-muted-foreground transition-all duration-300 ease-out",
          "translate-x-0 opacity-0",
          "group-hover:translate-x-1 group-hover:opacity-100",
          "group-data-[state=open]:translate-x-0 group-data-[state=open]:opacity-0",
        )}
        aria-hidden
      />
      <ChevronDown
        className={cn(
          "absolute h-3.5 w-3.5 shrink-0 stroke-2 text-muted-foreground transition-all duration-200",
          "rotate-0 opacity-0",
          "group-data-[state=open]:rotate-180 group-data-[state=open]:opacity-100",
        )}
        aria-hidden
      />
    </span>
  );
}
