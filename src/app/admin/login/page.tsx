import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import "../admin.css";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="login">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
