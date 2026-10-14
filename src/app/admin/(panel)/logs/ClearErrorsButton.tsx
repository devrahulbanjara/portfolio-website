"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { clearErrors } from "../../actions";

export function ClearErrorsButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="abtn"
      disabled={pending}
      onClick={() => {
        if (confirm("Clear all error logs?")) start(async () => {
          await clearErrors();
          router.refresh();
        });
      }}
    >
      {pending ? "Clearing…" : "Clear error log"}
    </button>
  );
}
