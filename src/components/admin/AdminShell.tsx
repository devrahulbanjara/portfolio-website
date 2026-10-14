"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./icons";

const KEY = "adm_side";
const EVENT = "adm-side-change";

/** Runs before first paint (inlined in the layout) so a collapsed sidebar never flashes open. */
export const SIDEBAR_BOOT = `try{if(localStorage.getItem("${KEY}")==="collapsed")document.documentElement.dataset.admSide="collapsed"}catch(e){}`;

const subscribe = (cb: () => void) => (addEventListener(EVENT, cb), () => removeEventListener(EVENT, cb));
const isCollapsed = () => document.documentElement.dataset.admSide === "collapsed";

function setCollapsed(collapsed: boolean) {
  if (collapsed) document.documentElement.dataset.admSide = "collapsed";
  else delete document.documentElement.dataset.admSide;
  try {
    localStorage.setItem(KEY, collapsed ? "collapsed" : "expanded");
  } catch {}
  dispatchEvent(new Event(EVENT));
}

/**
 * The admin frame. Desktop: a sidebar that folds into an icon rail (button on
 * its edge, or ⌘/Ctrl+B), remembered per browser. Phone: a top bar whose menu
 * button slides the same sidebar in as a drawer.
 */
export function AdminShell({ side, brand, children }: { side: React.ReactNode; brand: React.ReactNode; children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, isCollapsed, () => false);
  const pathname = usePathname();
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawer = drawerPath === pathname;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Enable transitions only after the first paint, so the initial state doesn't animate in.
    const id = requestAnimationFrame(() => setReady(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerPath(null);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        const t = e.target as HTMLElement | null;
        if (t?.closest("input, textarea, select, [contenteditable]")) return;
        e.preventDefault();
        setCollapsed(!isCollapsed());
      }
    };
    addEventListener("keydown", onKey);
    return () => (cancelAnimationFrame(id), removeEventListener("keydown", onKey));
  }, []);

  return (
    <div className={`adm ${ready ? "is-ready" : ""} ${drawer ? "drawer-open" : ""}`}>
      <header className="adm-topbar">
        <button type="button" className="adm-iconbtn" onClick={() => setDrawerPath(pathname)} aria-label="Open menu" aria-expanded={drawer} aria-controls="adm-side">
          <Icon name="menu" size={20} />
        </button>
        {brand}
      </header>
      <aside id="adm-side" className="adm-side" aria-label="Admin navigation">
        <div className="adm-sidehead">
          {brand}
          <button type="button" className="adm-iconbtn adm-drawer-close" onClick={() => setDrawerPath(null)} aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
          <button
            type="button"
            className="adm-iconbtn adm-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="adm-side"
            data-tip={`${collapsed ? "Expand" : "Collapse"} sidebar · ⌘B`}
          >
            <Icon name="panel" size={18} />
          </button>
        </div>
        {side}
      </aside>
      <div className="adm-scrim" onClick={() => setDrawerPath(null)} aria-hidden />
      <main className="adm-main">{children}</main>
    </div>
  );
}
