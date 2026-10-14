# rahuldevbanjara.com.np

Personal site of **Rahul Dev Banjara** — portfolio, blog, an AI assistant visitors can talk to, and a private admin panel with its own AI assistant.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, libSQL (Turso), Gemini + Groq.

---

## Inspiration & credits

This site stands on other people's ideas. The main ones:

- **[Dennis Snellenberg](https://dennissnellenberg.com/)** — the whole visual direction comes from his portfolio: the light photographic hero with the name scrolling in a marquee over a cut-out portrait, the "Hello" preloader, the dark curtain with a curved edge between pages, magnetic round buttons, the slide-in menu, the hover preview on the project list, and the curved dark footer. The code here is written from scratch, but the look and feel is his — go see the original.
- **Apple's "hello" setup screen** — the idea of cycling the greeting through many languages (Hello, नमस्ते, Bonjour, こんにちは …) on first load.
- **Samsung Galaxy AI** — the four-point sparkle mark and the moving gradient glow the assistant shows while it's working.

Typeface: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and Geist Mono, via Google Fonts.

---

## Run it locally

```bash
npm install
cp .env.example .env.local      # then fill in at least AUTH_SECRET and GEMINI_API_KEY
npm run db:setup                # creates data/site.db
npm run admin:password          # choose your admin password
npm run dev                     # http://localhost:3000  ·  admin: /admin
```

Locally, the database is a file (`data/site.db`) and uploaded images go to `data/uploads/` — no accounts needed.

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` | TypeScript check |
| `npm run db:setup` | Create or upgrade the database schema |
| `npm run admin:password` | Set the admin password (signs out all sessions) |
| `npm run seed:posts` | Load `content/seed-posts/*.md` as drafts |

All scripts read `.env.local`. To run one against production, put the production variables in a file and pass it: `ENV_FILE=.env.production.local npm run admin:password`.

---

## Deploy to Vercel

Vercel has no permanent disk, so the database lives on **Turso** and images on **Vercel Blob**. Both have permanent free plans that this site fits inside.

### 1. Create the database (Turso)

1. Sign up at [turso.tech](https://turso.tech) and install the CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Create a database close to your visitors (e.g. Mumbai):
   ```bash
   turso auth login
   turso db create portfolio --location bom
   turso db show portfolio --url          # → TURSO_DATABASE_URL
   turso db tokens create portfolio       # → TURSO_AUTH_TOKEN
   ```

### 2. Put the code on GitHub

```bash
git add -A && git commit -m "Portfolio"
gh repo create rahuldevbanjara-portfolio --private --source . --push
```

### 3. Import the project in Vercel

1. [vercel.com/new](https://vercel.com/new) → import the repository (framework: Next.js, defaults are fine).
2. **Settings → Environment Variables** (Production), add:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.rahuldevbanjara.com.np` |
   | `AUTH_SECRET` | output of `openssl rand -base64 48` |
   | `ADMIN_EMAIL` | `rdbanjara07@gmail.com` |
   | `GEMINI_API_KEY` | public assistant key |
   | `GROQ_API_KEY` | backup model key (optional) |
   | `ADMIN_GEMINI_API_KEY` | admin assistant key |
   | `TURSO_DATABASE_URL` | from step 1 |
   | `TURSO_AUTH_TOKEN` | from step 1 |

3. **Storage → Create → Blob** and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. Deploy.

### 4. Set up the production database and your password

Create `.env.production.local` (git-ignored) containing just `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then:

```bash
ENV_FILE=.env.production.local npm run db:setup
ENV_FILE=.env.production.local npm run admin:password
ENV_FILE=.env.production.local npm run seed:posts      # optional: the starter drafts
```

### 5. Connect your domain

Vercel → **Settings → Domains** → add `rahuldevbanjara.com.np` and `www.rahuldevbanjara.com.np`, then set the DNS records Vercel shows at your domain registrar.

### 6. Tell search engines

1. [Google Search Console](https://search.google.com/search-console) → add the domain → verify via DNS.
2. **Sitemaps** → submit `https://www.rahuldevbanjara.com.np/sitemap.xml`.
3. Publish posts from the admin; they appear in the sitemap and RSS feed immediately.

---

## How it fits together

```
src/
  app/(site)/         public pages: home, about, work, teaching, services, blog, contact, résumé
  app/admin/          private admin panel (login, overview, messages, conversations, analytics, posts, logs, settings)
  app/api/chat/       public assistant (streaming), feedback, "send a message to Rahul"
  app/api/admin/      admin assistant + image upload (admin only)
  app/api/t/          first-party, cookie-free analytics beacon
  content/profile.ts  every fact about Rahul — pages, résumé, llms.txt and the assistant all read this
  lib/agent/          public assistant: tools, guardrails, Gemini → Groq router, per-session memory
  lib/admin-agent/    admin assistant: data tools, read-only SQL, confirm-first actions
  lib/db-core.ts      libSQL client (Turso in production, a local file in development) + schema
  lib/schemas/        Zod schemas for every input boundary
```

**Security in short:** admin pages are checked in `proxy.ts` *and* again on the server; sessions are signed cookies that rotate with the password; login is rate-limited and audited; the public assistant can't send anything without a visitor's click; the admin assistant's big changes need your confirmation; uploads are verified by their actual file bytes.

**Updating your details:** edit `src/content/profile.ts` (projects are still placeholders there) and redeploy.
