import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

/* Minimal hast types so we don't depend on @types/hast directly. */
type HNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HNode[]; value?: string };

export type TocItem = { id: string; text: string; depth: 2 | 3 };

function textOf(n: HNode): string {
  if (n.type === "text") return n.value ?? "";
  return (n.children ?? []).map(textOf).join("");
}

function walk(n: HNode, fn: (n: HNode, parent: HNode | null) => void, parent: HNode | null = null) {
  fn(n, parent);
  for (const c of n.children ?? []) walk(c, fn, n);
}

/** GitHub-style callouts: > [!NOTE] / [!TIP] / [!WARNING] / [!IMPORTANT] / [!CAUTION] */
function rehypeCallouts() {
  return (tree: HNode) => {
    walk(tree, (node) => {
      if (node.tagName !== "blockquote") return;
      const firstP = node.children?.find((c) => c.tagName === "p");
      const firstText = firstP?.children?.[0];
      if (!firstText || firstText.type !== "text") return;
      const m = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i.exec(firstText.value ?? "");
      if (!m) return;
      const kind = m[1].toLowerCase();
      firstText.value = (firstText.value ?? "").slice(m[0].length);
      node.tagName = "aside";
      node.properties = { ...node.properties, className: ["callout", `callout-${kind}`], "data-kind": kind };
      node.children = [
        { type: "element", tagName: "span", properties: { className: ["callout-label"] }, children: [{ type: "text", value: kind }] },
        ...(node.children ?? []),
      ];
    });
  };
}

/** Images become lazy <figure>s; the alt text doubles as the caption when it starts with "^". */
function rehypeFigures() {
  return (tree: HNode) => {
    walk(tree, (node) => {
      if (node.tagName !== "p" || node.children?.length !== 1) return;
      const img = node.children[0];
      if (img.tagName !== "img") return;
      img.properties = { ...img.properties, loading: "lazy", decoding: "async" };
      const alt = String(img.properties?.alt ?? "");
      node.tagName = "figure";
      if (alt.startsWith("^")) {
        img.properties.alt = alt.slice(1).trim();
        node.children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt.slice(1).trim() }] });
      }
    });
  };
}

/** External links open in a new tab, safely. Tables get a scroll wrapper. */
function rehypeLinksAndTables() {
  return (tree: HNode) => {
    walk(tree, (node, parent) => {
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href)) node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" };
      }
      if (node.tagName === "table" && parent && parent.tagName !== "div") {
        const idx = parent.children!.indexOf(node);
        parent.children![idx] = { type: "element", tagName: "div", properties: { className: ["table-wrap"] }, children: [node] };
      }
    });
  };
}

function collectToc(toc: TocItem[]) {
  return () => (tree: HNode) => {
    walk(tree, (node) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        toc.push({ id: String(node.properties.id), text: textOf(node).trim(), depth: node.tagName === "h2" ? 2 : 3 });
      }
    });
  };
}

export async function renderMarkdown(md: string) {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype) // raw HTML in markdown is dropped (no allowDangerousHtml)
    .use(rehypeSlug)
    .use(collectToc(toc))
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Link to this section" },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, {
      theme: { dark: "vesper", light: "vesper" },
      keepBackground: false,
      defaultLang: { block: "plaintext" },
    })
    .use(rehypeCallouts)
    .use(rehypeFigures)
    .use(rehypeLinksAndTables)
    .use(rehypeStringify)
    .process(md);
  return { html: String(file), toc };
}

export function readingStats(md: string) {
  const r = readingTime(md);
  return { minutes: Math.max(1, Math.round(r.minutes)), words: r.words };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Plain-text excerpt from markdown, for meta descriptions when none is set. */
export function plainExcerpt(md: string, len = 160) {
  const text = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > len ? text.slice(0, len - 1).replace(/\s\S*$/, "") + "…" : text;
}
