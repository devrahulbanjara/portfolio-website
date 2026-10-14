import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminShell, SIDEBAR_BOOT } from "@/components/admin/AdminShell";
import { Icon } from "@/components/admin/icons";
import { AdminAssistant } from "@/components/admin/AdminAssistant";
import "@/components/agent/studio.css";
import { AgentMark } from "@/components/agent/AgentMark";
import { get, safely } from "@/lib/db";
import { logoutAction } from "../actions";
import "../admin.css";

/** Private, per-request pages: no prerendered shell needed, so let them block. */
export const instant = false;

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

async function NavWithCounts() {
  await connection();
  const unread = await safely(async () => (await get<{ n: number }>("SELECT COUNT(*) n FROM contact_messages WHERE read = 0 AND archived = 0"))?.n ?? 0, 0);
  return <AdminNav unread={unread} />;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const brand = (
    <Link href="/admin" className="adm-brand" data-tip="Rahul's admin">
      <AgentMark active={false} size={22} />
      <span className="adm-label">
        Rahul&apos;s admin
        <small>rahuldevbanjara.com.np</small>
      </span>
    </Link>
  );
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SIDEBAR_BOOT }} />
      <AdminShell
        brand={brand}
        side={
          <>
            <AdminAssistant />
            <Suspense fallback={<nav className="adm-nav" aria-hidden />}>
              <NavWithCounts />
            </Suspense>
            <div className="adm-side-foot">
              <Link href="/" target="_blank" className="adm-foot-link" data-tip="View site">
                <Icon name="external" />
                <span className="adm-label">View site</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="adm-foot-link" data-tip="Sign out">
                  <Icon name="logout" />
                  <span className="adm-label">Sign out</span>
                </button>
              </form>
            </div>
          </>
        }
      >
        {children}
      </AdminShell>
    </>
  );
}
