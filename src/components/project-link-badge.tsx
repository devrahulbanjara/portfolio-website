import { Globe } from "lucide-react";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { ProjectLink } from "@/lib/content/types";

function HuggingFaceMark(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-3.2 7.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm6.4 0a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM12 18c-2.5 0-4.6-1.6-5.4-3.8a.6.6 0 01.56-.8h9.68a.6.6 0 01.56.8C16.6 16.4 14.5 18 12 18z" />
    </svg>
  );
}

/** Each link kind gets the mark of the platform it actually points at. */
const MARKS = {
  repository: Icons.github,
  model: HuggingFaceMark,
  live: Globe,
  article: Globe,
} as const;

/**
 * Solid pill with the platform's mark, rather than an underlined text link.
 * A recognizable GitHub badge is scannable at a glance, which matters on cards
 * where the link is the call to action.
 */
export default function ProjectLinkBadge({ link }: { link: ProjectLink }) {
  const Mark = MARKS[link.kind] ?? Globe;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.label} (opens in a new tab)`}
      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Badge className="flex gap-1.5 px-2.5 py-1 transition-opacity hover:opacity-85">
        <Mark className="size-3.5" />
        {link.label}
      </Badge>
    </a>
  );
}
