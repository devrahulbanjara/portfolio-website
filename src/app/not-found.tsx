import type { Metadata } from "next";
import { ErrorScreen } from "@/components/site/ErrorScreen";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="wrap">
      <ErrorScreen code="404" title="This page doesn't exist" body="The link may be old, or the page may have moved. Everything on the site is one click away from the homepage." />
    </main>
  );
}
