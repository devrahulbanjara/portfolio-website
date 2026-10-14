import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * A deliberately tiny markdown subset for agent answers, rendered as React
 * nodes (never innerHTML): paragraphs, bullet/numbered lists, **bold**,
 * _italic_, `code`, and [links](/internal or https://…).
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("_")) out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)!;
      const href = lm[2];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href} data-ev="agent_link" data-ev-href={href}>
            {lm[1]}
          </Link>
        ) : (
          <a key={k} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" data-ev="agent_link" data-ev-href={href}>
            {lm[1]}
          </a>
        ),
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MiniMarkdown({ text, caret }: { text: string; caret?: boolean }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="agent-md">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const isLast = bi === blocks.length - 1;
        const c = caret && isLast ? <span className="agent-caret" aria-hidden /> : null;
        if (lines.length && lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.replace(/^\s*[-*•]\s+/, ""), `${bi}-${li}`)}
                  {li === lines.length - 1 ? c : null}
                </li>
              ))}
            </ul>
          );
        }
        if (lines.length && lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi}>
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.replace(/^\s*\d+[.)]\s+/, ""), `${bi}-${li}`)}
                  {li === lines.length - 1 ? c : null}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
            {c}
          </p>
        );
      })}
    </div>
  );
}
