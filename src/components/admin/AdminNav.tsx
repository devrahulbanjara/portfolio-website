"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const ITEMS: { href: string; label: string; icon: IconName; badge?: "unread" }[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/messages", label: "Messages", icon: "messages", badge: "unread" },
  { href: "/admin/conversations", label: "Conversations", icon: "conversations" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/posts", label: "Posts", icon: "posts" },
  { href: "/admin/logs", label: "Logs", icon: "logs" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {ITEMS.map((i) => {
        const on = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={on ? "is-on" : ""} aria-current={on ? "page" : undefined} data-tip={i.label}>
            <Icon name={i.icon} />
            <span className="adm-label">{i.label}</span>
            {i.badge === "unread" && unread > 0 && <span className="adm-badge">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
