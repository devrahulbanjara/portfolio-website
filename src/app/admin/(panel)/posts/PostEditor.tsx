"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { savePost, deletePost, type ActionState } from "../../actions";
import { previewMarkdown } from "./preview";

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seoDescription ?? "");
  const [cover, setCover] = useState(post?.coverUrl ?? "");
  const [status, setStatus] = useState<EditorPost["status"]>(post?.status ?? "draft");
  const [view, setView] = useState<"write" | "split" | "preview">("split");
  const [html, setHtml] = useState("");
  const [uploading, setUploading] = useState(false);
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

  const upload = async (file: File, insert: boolean) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      alert((await res.json().catch(() => ({})))?.error ?? "Upload failed");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    if (insert) wrap(`![^${file.name.replace(/\.[^.]+$/, "")}](${url})`, "", "");
    else setCover(url);
    setDirty(true);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const pageTitle = seoTitle || title || "Post title";
  const pageDesc = seoDesc || excerpt || content.replace(/[#*_>`[\]()!-]/g, "").slice(0, 155);

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
              <label className="md-toolbar-upload" style={{ display: "inline-flex", alignItems: "center", padding: "0 0.5rem", fontSize: 13, cursor: "pointer", borderRadius: 8 }}>
                {uploading ? "Uploading…" : "Image"}
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], true)} />
              </label>
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
                  const f = [...e.clipboardData.files].find((x) => x.type.startsWith("image/"));
                  if (f) {
                    e.preventDefault();
                    void upload(f, true);
                  }
                }}
                onDrop={(e) => {
                  const f = [...e.dataTransfer.files].find((x) => x.type.startsWith("image/"));
                  if (f) {
                    e.preventDefault();
                    void upload(f, true);
                  }
                }}
                placeholder={"Write in Markdown…\n\n## A heading\n\nParagraphs, **bold**, lists, `code`, > quotes, tables and images all work.\nPaste or drop an image to upload it."}
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
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], false)} />
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
