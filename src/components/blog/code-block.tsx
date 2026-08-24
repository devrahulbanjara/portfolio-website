import { codeToHtml, bundledLanguages, type BundledLanguage } from "shiki";

import { CopyButton } from "@/components/blog/copy-button";

/**
 * Server-rendered syntax highlighting.
 *
 * The previous version highlighted in a browser effect, which meant shipping
 * Shiki to every reader and showing unstyled code until it finished. Doing it
 * here costs nothing at runtime — the page is statically rendered anyway — and
 * leaves only the copy button as client JavaScript.
 *
 * Colours come from CSS variables (--shiki-light / --shiki-dark, see
 * globals.css) so light and dark themes switch without re-highlighting.
 */
export async function CodeBlock({
  code,
  language,
  filename,
}: {
  code: string;
  language?: string | null;
  filename?: string | null;
}) {
  const requested = (language || "text").toLowerCase();
  // An unknown language makes Shiki throw rather than degrade, and one bad code
  // block should not take down the whole article.
  const lang: BundledLanguage | "text" =
    requested in bundledLanguages ? (requested as BundledLanguage) : "text";

  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          node.properties.class = `${node.properties.class ?? ""} m-0! overflow-x-auto p-3 text-sm leading-relaxed`;
          // Shiki inlines a background colour that fights the card behind it.
          node.properties.style = undefined;
          node.properties.tabindex = "0";
        },
      },
    ],
  });

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border">
      {filename ? (
        <div className="border-b border-border bg-muted/50 p-3 font-mono text-xs font-medium text-foreground">
          {filename}
        </div>
      ) : null}

      <CopyButton value={code} className={filename ? "top-13" : "top-3"} />

      <div
        className="font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
