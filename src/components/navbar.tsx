import { HomeIcon, NotebookIcon } from "lucide-react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { resolveIcon } from "@/components/icon-registry";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { profile } from "@/lib/content";

/**
 * Route is `/blogs` (plural) because the existing published articles rank at
 * those URLs. The visible label is "Writing".
 */
const routes = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/blogs", icon: NotebookIcon, label: "Writing" },
];

const TOOLTIP_CLASS =
  "rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]";
const DOCK_ICON_CLASS =
  "rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors";

function DockLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isExternal = href.startsWith("http");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          aria-label={label}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          <DockIcon className={DOCK_ICON_CLASS}>
            <Icon className="size-full overflow-hidden rounded-sm object-contain" />
          </DockIcon>
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className={TOOLTIP_CLASS}>
        <p>{label}</p>
        <TooltipArrow className="fill-primary" />
      </TooltipContent>
    </Tooltip>
  );
}

export default function Navbar() {
  const socialLinks = profile.social.filter((link) => link.inNav);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <Dock className="pointer-events-auto relative z-50 mx-auto flex h-14 w-fit gap-2 border bg-card/90 p-2 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur-3xl">
        {routes.map((route) => (
          <DockLink key={route.href} {...route} />
        ))}

        <Separator
          orientation="vertical"
          className="m-auto h-2/3 w-px bg-border"
        />

        {socialLinks.map((link) => (
          <DockLink
            key={link.name}
            href={link.url}
            label={link.name}
            icon={resolveIcon(link.icon)}
          />
        ))}

        <Separator
          orientation="vertical"
          className="m-auto h-2/3 w-px bg-border"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <DockIcon className={DOCK_ICON_CLASS}>
              <ModeToggle className="size-full cursor-pointer" />
            </DockIcon>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className={TOOLTIP_CLASS}>
            <p>Theme</p>
            <TooltipArrow className="fill-primary" />
          </TooltipContent>
        </Tooltip>
      </Dock>
    </div>
  );
}
