/**
 * Rendered instead of the Studio when NEXT_PUBLIC_SANITY_PROJECT_ID is unset.
 *
 * Without this the Studio throws an opaque "Configuration must contain
 * `projectId`" in the browser console and renders a blank page, which is a
 * miserable first-run experience.
 */
export function StudioNotConfigured() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Sanity is not configured yet
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Set <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
        <code className="font-mono">NEXT_PUBLIC_SANITY_DATASET</code> in{" "}
        <code className="font-mono">.env.local</code>, then restart the dev
        server. Create the project with:
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs">
        <code>npx sanity@latest init --env</code>
      </pre>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Until then <code className="font-mono">/blogs</code> renders an empty
        state rather than failing the build.
      </p>
    </main>
  );
}
