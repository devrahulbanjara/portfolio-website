"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setMessageState, deleteMessage } from "../../actions";

export function MessageActions({ id, email, name, read, archived }: { id: string; email: string; name: string; read: boolean; archived: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (fn: () => Promise<void>) => start(async () => {
    await fn();
    router.refresh();
  });
  return (
    <div className="msg-actions">
      <a className="abtn abtn-primary" href={`mailto:${email}?subject=${encodeURIComponent(`Re: your message to Rahul`)}&body=${encodeURIComponent(`Hi ${name.split(" ")[0]},\n\n`)}`} onClick={() => !read && act(() => setMessageState(id, { read: true }))}>
        Reply by email
      </a>
      <button type="button" className="abtn" disabled={pending} onClick={() => act(() => setMessageState(id, { read: !read }))}>
        Mark as {read ? "unread" : "read"}
      </button>
      <button type="button" className="abtn" disabled={pending} onClick={() => act(() => setMessageState(id, { archived: !archived, read: true }))}>
        {archived ? "Move to inbox" : "Archive"}
      </button>
      <button
        type="button"
        className="abtn abtn-danger"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this message permanently?")) act(() => deleteMessage(id));
        }}
      >
        Delete
      </button>
    </div>
  );
}
