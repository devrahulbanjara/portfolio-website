"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/messages", label: "Messages", badge: "unread" as const },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {ITEMS.map((i) => {
        const on = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={on ? "is-on" : ""} aria-current={on ? "page" : undefined}>
            <span>{i.label}</span>
            {i.badge === "unread" && unread > 0 && <span className="adm-badge">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
