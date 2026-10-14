import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { messages } from "@/lib/admin-data";
import { PageHead, Loading, when } from "@/components/admin/ui";
import { MessageActions } from "./MessageActions";

export const metadata = { title: "Messages" };

const TOPIC: Record<string, string> = { hiring: "Full-time role", project: "Project", training: "Training", other: "Other", chat: "Via assistant" };

export default function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  return (
    <Suspense fallback={<Loading />}>
      <Messages searchParams={searchParams} />
    </Suspense>
  );
}

async function Messages({ searchParams }: Pick<PageProps<"/admin/messages">, "searchParams">) {
  await requireAdmin();
  const view = (await searchParams).view === "archived" ? "archived" : "inbox";
  const list = await messages(view);
  return (
    <>
      <PageHead title="Messages" sub="From the contact form and from visitors who asked the assistant to pass a message on.">
        <nav className="seg">
          <Link href="/admin/messages" className={view === "inbox" ? "is-on" : ""}>
            Inbox
          </Link>
          <Link href="/admin/messages?view=archived" className={view === "archived" ? "is-on" : ""}>
            Archived
          </Link>
        </nav>
      </PageHead>
      {list.length === 0 && <p className="empty">{view === "inbox" ? "Your inbox is empty." : "Nothing archived."}</p>}
      {list.map((m) => (
        <article key={m.id} className={`msg ${m.read ? "" : "is-unread"}`}>
          <div className="msg-head">
            <div>
              <strong>{m.name}</strong> <span className="muted">&lt;{m.email}&gt;</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {m.topic && <span className={`pill ${m.topic === "chat" ? "info" : ""}`}>{TOPIC[m.topic] ?? m.topic}</span>}
              <span className="muted" style={{ fontSize: 13 }}>
                {when(m.ts)}
              </span>
            </div>
          </div>
          <p className="msg-body">{m.message}</p>
          <MessageActions id={m.id} email={m.email} name={m.name} read={!!m.read} archived={!!m.archived} />
        </article>
      ))}
    </>
  );
}
