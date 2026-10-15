"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { savePost, deletePost, type ActionState } from "../../actions";
import { upload as blobUpload } from "@vercel/blob/client";
import { previewMarkdown } from "./preview";

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  highlights: string;
  coverUrl: string;
  coverAlt: string;
  tags: string;
  status: "draft" | "published" | "scheduled";
  featured: boolean;
  publishedAt: number | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
};

const toLocalInput = (ms: number | null) => (ms ? new Date(ms - new Date(ms).getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "");
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function PostEditor({ post }: { post: EditorPost | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionState, FormData>(savePost, { ok: false });
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [highlights, setHighlights] = useState(post?.highlights ?? "");
  const highlightCount = highlights.split("\n").filter((l) => l.trim()).length;
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seoDescription ?? "");
  const [cover, setCover] = useState(post?.coverUrl ?? "");
  const [status, setStatus] = useState<EditorPost["status"]>(post?.status ?? "draft");
  const [view, setView] = useState<"write" | "split" | "preview">("split");
  const [html, setHtml] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  // "Unsaved" = edited since the last save result arrived (or the last save failed).
  const [editedAt, setEditedAt] = useState<ActionState | null>(null);
  const dirty = editedAt !== null && (editedAt === state || !state.ok);
  const setDirty = (v: boolean) => setEditedAt(v ? state : null);
  // The host is only known in the browser; read it without an effect.
  const site = useSyncExternalStore(
    () => () => {},
    () => location.host,
    () => "",
  );
  const area = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [delPending, startDel] = useTransition();

  // After the first save of a new post, move to its edit URL.
  useEffect(() => {
    if (state.ok && state.id && !post) router.replace(`/admin/posts/${state.id}`);
  }, [state, post, router]);

  // Live preview, rendered by the same pipeline as the public site (debounced).
  useEffect(() => {
    if (view === "write") return;
    const t = setTimeout(() => previewMarkdown(content).then(setHtml), 300);
    return () => clearTimeout(t);
  }, [content, view]);

  // Warn before leaving with unsaved changes; ⌘S / Ctrl+S saves.
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    addEventListener("beforeunload", before);
    addEventListener("keydown", key);
    return () => {
      removeEventListener("beforeunload", before);
      removeEventListener("keydown", key);
    };
  }, [dirty]);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = content.slice(s, e) || placeholder;
    const next = content.slice(0, s) + before + sel + after + content.slice(e);
    setContent(next);
    setDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = area.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = content.lastIndexOf("\n", s - 1) + 1;
    setContent(content.slice(0, lineStart) + prefix + content.slice(lineStart));
    setDirty(true);
    requestAnimationFrame(() => el.focus());
  };

  const direct = useRef<boolean | null>(null);
  /** Upload one file. On Vercel it goes straight to Blob (no 4.5 MB limit); locally it goes through the server. */
  const sendFile = async (file: File): Promise<{ url: string; mime: string }> => {
    direct.current ??= await fetch("/api/admin/upload/client")
      .then((r) => r.json())
      .then((j: { direct?: boolean }) => !!j.direct)
      .catch(() => false);
    if (direct.current) {
      const safe = file.name.toLowerCase().replace(/[^\w.-]+/g, "-").replace(/^-+/, "").slice(-80) || "file";
      const blob = await blobUpload(`uploads/${new Date().toISOString().slice(0, 7)}-${safe}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload/client",
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: (p) => setUploading(`Uploading ${Math.round(p.percentage)}%`),
      });
      const res = await fetch("/api/admin/upload/client", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: blob.url, name: file.name }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Upload failed");
      return j;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error ?? "Upload failed");
    return j;
  };

  /** Upload one or more files; each lands in the post as its own figure (images, GIFs and videos alike). */
  const upload = async (files: File[], insert: boolean) => {
    const out: string[] = [];
    for (const [i, file] of files.entries()) {
      setUploading(files.length > 1 ? `Uploading ${i + 1}/${files.length}…` : "Uploading…");
      try {
        const { url } = await sendFile(file);
        if (!insert) setCover(url);
        else out.push(`![^${file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "")}](${url})`);
      } catch (e) {
        alert(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(null);
    if (out.length) wrap(`\n\n${out.join("\n\n")}\n\n`, "", "");
    setDirty(true);
  };

  const embed = () => {
    const url = prompt("Paste a YouTube, Vimeo or Loom link — it becomes a player in the post.")?.trim();
    if (!url) return;
    if (!/^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|vimeo\.com|loom\.com)\//.test(url)) return alert("That link isn't from YouTube, Vimeo or Loom. For any other site, use Link.");
    wrap(`\n\n${url}\n\n`, "", "");
  };
  const MEDIA_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";
  const isMedia = (f: File) => f.type.startsWith("image/") || f.type.startsWith("video/");

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const pageTitle = seoTitle || title || "Post title";
  const pageDesc =
    seoDesc ||
    excerpt ||
    content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[#*_>`[\]()!|~-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 155);

  return (
    <form ref={formRef} action={action} onChange={() => setDirty(true)}>
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="adm-head">
        <div>
          <Link href="/admin/posts" className="muted" style={{ fontSize: 14 }}>
            ← All posts
          </Link>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {state.message && <span className={`toast ${state.ok ? "ok" : "bad"}`}>{state.message}</span>}
          {dirty && !pending && <span className="muted" style={{ fontSize: 13 }}>Unsaved changes</span>}
          {post && status !== "draft" && (
            <a className="abtn" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
              View ↗
            </a>
          )}
          <button type="submit" className="abtn abtn-primary" disabled={pending}>
            {pending ? "Saving…" : status === "draft" ? "Save draft" : status === "scheduled" ? "Schedule" : "Publish"}
          </button>
        </div>
      </div>

      <div className="editor">
        <div className="adm-card">
          <input
            className="editor-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Post title"
            aria-label="Title"
            required
          />
          {state.errors?.title && <p className="aerr">{state.errors.title}</p>}

          <div className="md-tabs" style={{ marginTop: "1rem" }}>
            <div className="md-toolbar" role="toolbar" aria-label="Formatting">
              <button type="button" onClick={() => linePrefix("## ")} title="Heading">H2</button>
              <button type="button" onClick={() => linePrefix("### ")} title="Subheading">H3</button>
              <button type="button" onClick={() => wrap("**")} title="Bold"><b>B</b></button>
              <button type="button" onClick={() => wrap("_")} title="Italic"><i>I</i></button>
              <button type="button" onClick={() => wrap("`")} title="Inline code">{"<>"}</button>
              <button type="button" onClick={() => wrap("[", "](https://)", "link text")} title="Link">Link</button>
              <button type="button" onClick={() => linePrefix("- ")} title="List">• List</button>
              <button type="button" onClick={() => linePrefix("> ")} title="Quote">❝</button>
              <button type="button" onClick={() => wrap("\n```python\n", "\n```\n", "code")} title="Code block">Code</button>
              <button type="button" onClick={() => linePrefix("> [!NOTE]\n> ")} title="Callout">Note</button>
              <label className="md-toolbar-upload" style={{ display: "inline-flex", alignItems: "center", padding: "0 0.5rem", fontSize: 13, cursor: "pointer", borderRadius: 8 }} title="Upload images, GIFs or videos (you can pick several)">
                {uploading ?? "Image / video"}
                <input
                  type="file"
                  accept={MEDIA_ACCEPT}
                  multiple
                  hidden
                  onChange={(e) => {
                    const fs = [...(e.target.files ?? [])];
                    e.target.value = "";
                    if (fs.length) void upload(fs, true);
                  }}
                />
              </label>
              <button type="button" onClick={embed} title="Embed a YouTube, Vimeo or Loom video">▶ Embed</button>
            </div>
            <nav className="seg">
              {(["write", "split", "preview"] as const).map((v) => (
                <a key={v} href="#" className={view === v ? "is-on" : ""} onClick={(e) => (e.preventDefault(), setView(v))}>
                  {v === "write" ? "Write" : v === "split" ? "Split" : "Preview"}
                </a>
              ))}
            </nav>
          </div>

          <div className={`md-split ${view === "split" ? "is-split" : ""}`}>
            {view !== "preview" && (
              <textarea
                ref={area}
                className="md-area"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={(e) => {
                  const fs = [...e.clipboardData.files].filter(isMedia);
                  if (fs.length) {
                    e.preventDefault();
                    void upload(fs, true);
                  }
                }}
                onDrop={(e) => {
                  const fs = [...e.dataTransfer.files].filter(isMedia);
                  if (fs.length) {
                    e.preventDefault();
                    void upload(fs, true);
                  }
                }}
                placeholder={"Write in Markdown…\n\n## A heading\n\nParagraphs, **bold**, lists, `code`, > quotes and tables all work.\nPaste or drop images, GIFs or videos to upload them.\nA YouTube, Vimeo or Loom link on its own line becomes a player."}
                aria-label="Post body (Markdown)"
              />
            )}
            {view === "preview" && <input type="hidden" name="content" value={content} />}
            {view !== "write" && (
              <div className={view === "split" ? "md-preview" : ""}>
                <div className="prose" dangerouslySetInnerHTML={{ __html: html || "<p style='color:var(--muted)'>Preview appears here.</p>" }} />
              </div>
            )}
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: "0.6rem" }}>
            {words.toLocaleString()} words · about {Math.max(1, Math.round(words / 230))} min read · ⌘S to save
          </p>
        </div>

        <aside className="side-stack">
          <section className="adm-card" style={{ display: "grid", gap: "0.9rem" }}>
            <h2 style={{ marginBottom: 0 }}>Publishing</h2>
            <div className="afield">
              <label htmlFor="status">Status</label>
              <select id="status" className="aselect" name="status" value={status} onChange={(e) => setStatus(e.target.value as EditorPost["status"])}>
                <option value="draft">Draft — only you can see it</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {status !== "draft" && (
              <div className="afield">
                <label htmlFor="publishedAt">{status === "scheduled" ? "Publish on" : "Publish date"}</label>
                <input id="publishedAt" className="ainput" type="datetime-local" name="publishedAt" defaultValue={toLocalInput(post?.publishedAt ?? null)} required={status === "scheduled"} />
                {state.errors?.publishedAt && <p className="aerr">{state.errors.publishedAt}</p>}
              </div>
            )}
            <div className="afield">
              <label htmlFor="slug">URL</label>
              <input
                id="slug"
                className="ainput"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="my-post"
              />
              <small>/blog/{slug || "…"}</small>
              {state.errors?.slug && <p className="aerr">{state.errors.slug}</p>}
            </div>
            <div className="afield">
              <label htmlFor="tags">Tags</label>
              <input id="tags" className="ainput" name="tags" defaultValue={post?.tags ?? ""} placeholder="agents, rag, aws" />
              <small>Comma-separated. Each tag gets its own page.</small>
            </div>
            <label className="acheck">
              <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} /> Feature on the blog
            </label>
          </section>

          <section className="adm-card" style={{ display: "grid", gap: "0.9rem" }}>
            <h2 style={{ marginBottom: 0 }}>Cover image</h2>
            <label className="cover-drop">
              {/* eslint-disable-next-line @next/next/no-img-element -- local upload preview */}
              {cover ? <img src={cover} alt="" /> : <span>{uploading ? "Uploading…" : "Click to upload a cover\n(1600×800 works best)"}</span>}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden onChange={(e) => e.target.files?.[0] && upload([e.target.files[0]], false)} />
            </label>
            <input type="hidden" name="coverUrl" value={cover} />
            {cover && (
              <>
                <input className="ainput" name="coverAlt" defaultValue={post?.coverAlt ?? ""} placeholder="Describe the image (for screen readers & SEO)" />
                <button type="button" className="abtn" onClick={() => setCover("")}>
                  Remove cover
                </button>
              </>
            )}
          </section>

          <section className="adm-card" style={{ display: "grid", gap: "0.9rem" }}>
            <h2 style={{ marginBottom: 0 }}>Key highlights</h2>
            <div className="afield">
              <label htmlFor="highlights">One point per line (optional)</label>
              <textarea
                id="highlights"
                className="atextarea"
                name="highlights"
                rows={6}
                maxLength={3000}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder={"The exam keeps its four domains but adds RAG and agents.\nAgentCore is now in scope.\n…"}
              />
              <small>
                {highlightCount || "No"} highlight{highlightCount === 1 ? "" : "s"} · shown in a box at the top of the post; leave empty to hide it
              </small>
            </div>
          </section>

          <section className="adm-card" style={{ display: "grid", gap: "0.9rem" }}>
            <h2 style={{ marginBottom: 0 }}>Search & sharing</h2>
            <div className="serp" aria-label="Google preview">
              <div className="u">{site} › blog › {slug || "…"}</div>
              <div className="t">{pageTitle.length > 60 ? pageTitle.slice(0, 58) + "…" : pageTitle}</div>
              <div className="d">{pageDesc.length > 158 ? pageDesc.slice(0, 156) + "…" : pageDesc || "Your summary will appear here."}</div>
            </div>
            <div className="afield">
              <label htmlFor="excerpt">Summary</label>
              <textarea id="excerpt" className="atextarea" name="excerpt" rows={3} maxLength={400} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="One or two sentences shown in lists and search results." />
            </div>
            <div className="afield">
              <label htmlFor="seoTitle">Search title (optional)</label>
              <input id="seoTitle" className="ainput" name="seoTitle" maxLength={120} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              <small>{(seoTitle || title).length}/60 characters is ideal</small>
            </div>
            <div className="afield">
              <label htmlFor="seoDescription">Search description (optional)</label>
              <textarea id="seoDescription" className="atextarea" name="seoDescription" rows={3} maxLength={200} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
              <small>{(seoDesc || excerpt).length}/155 characters is ideal</small>
            </div>
            <div className="afield">
              <label htmlFor="canonicalUrl">Canonical URL (if first published elsewhere)</label>
              <input id="canonicalUrl" className="ainput" name="canonicalUrl" type="url" defaultValue={post?.canonicalUrl ?? ""} placeholder="https://…" />
              {state.errors?.canonicalUrl && <p className="aerr">{state.errors.canonicalUrl}</p>}
            </div>
          </section>

          {post && (
            <button
              type="button"
              className="abtn abtn-danger"
              disabled={delPending}
              onClick={() => {
                if (confirm(`Delete “${post.title}”? This can't be undone.`)) startDel(() => deletePost(post.id));
              }}
            >
              Delete post
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
