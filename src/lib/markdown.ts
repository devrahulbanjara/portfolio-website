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
      if (node.tagName === "img") node.properties = { loading: "lazy", decoding: "async", ...node.properties };
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

/**
 * Turn a YouTube / Vimeo / Loom URL into a privacy-friendly embed URL.
 * Only these hosts are allowed and IDs are strictly validated, so markdown
 * can never inject an arbitrary iframe.
 */
export function embedFor(raw: string): { src: string; title: string; vertical: boolean } | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  const id = (v: string | null | undefined, re = /^[\w-]{6,20}$/) => (v && re.test(v) ? v : null);
  const seconds = (t: string | null) => {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return Number(t);
    const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
    return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
  };
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    const path = u.pathname.split("/").filter(Boolean);
    const shorts = path[0] === "shorts";
    const v = host === "youtu.be" ? id(path[0]) : u.pathname === "/watch" ? id(u.searchParams.get("v")) : ["embed", "shorts", "live"].includes(path[0]) ? id(path[1]) : null;
    if (!v) return null;
    const start = seconds(u.searchParams.get("t") ?? u.searchParams.get("start"));
    return { src: `https://www.youtube-nocookie.com/embed/${v}?rel=0${start ? `&start=${start}` : ""}`, title: "YouTube video", vertical: shorts };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = id(u.pathname.split("/").filter(Boolean).find((x) => /^\d+$/.test(x)), /^\d{5,12}$/);
    return v ? { src: `https://player.vimeo.com/video/${v}?dnt=1`, title: "Vimeo video", vertical: false } : null;
  }
  if (host === "loom.com") {
    const [kind, v] = u.pathname.split("/").filter(Boolean);
    const ok = (kind === "share" || kind === "embed") && id(v, /^[a-f0-9]{20,40}$/);
    return ok ? { src: `https://www.loom.com/embed/${v}`, title: "Loom video", vertical: false } : null;
  }
  return null;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/**
 * Media in its own paragraph:
 *   - a bare YouTube / Vimeo / Loom link, or ![^caption](that link)  → responsive embed
 *   - ![^caption](clip.mp4 / .webm / .mov)                            → native video player
 * GIFs and other images stay images (handled by rehypeFigures).
 */
function rehypeEmbeds() {
  return (tree: HNode) => {
    walk(tree, (node) => {
      if (node.tagName !== "p") return;
      const kids = (node.children ?? []).filter((c) => !(c.type === "text" && !(c.value ?? "").trim()));
      if (kids.length !== 1) return;
      const only = kids[0];
      let url = "";
      let caption = "";
      if (only.tagName === "a" && textOf(only).trim() === String(only.properties?.href ?? "")) url = String(only.properties?.href);
      else if (only.tagName === "img") {
        url = String(only.properties?.src ?? "");
        const alt = String(only.properties?.alt ?? "");
        caption = alt.startsWith("^") ? alt.slice(1).trim() : "";
      } else return;

      const embed = embedFor(url);
      const figcaption: HNode[] = caption ? [{ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] }] : [];
      if (embed) {
        node.tagName = "figure";
        node.properties = { className: ["embed", ...(embed.vertical ? ["embed-vertical"] : [])] };
        node.children = [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["embed-frame"] },
            children: [
              {
                type: "element",
                tagName: "iframe",
                properties: {
                  src: embed.src,
                  title: caption || embed.title,
                  loading: "lazy",
                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen",
                  allowFullScreen: true,
                  referrerPolicy: "strict-origin-when-cross-origin",
                },
                children: [],
              },
            ],
          },
          ...figcaption,
        ];
      } else if (only.tagName === "img" && VIDEO_EXT.test(url) && /^(https:\/\/|\/)/.test(url)) {
        node.tagName = "figure";
        node.properties = { className: ["video"] };
        node.children = [
          {
            type: "element",
            tagName: "video",
            properties: { src: url, controls: true, playsInline: true, preload: "metadata", ...(caption ? { ariaLabel: caption } : {}) },
            children: [],
          },
          ...figcaption,
        ];
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
    .use(rehypeEmbeds)
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
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > len ? text.slice(0, len - 1).replace(/\s\S*$/, "") + "…" : text;
}
