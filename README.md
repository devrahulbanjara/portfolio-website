# rahuldevbanjara.com.np

Personal portfolio and technical blog for Rahul Dev Banjara — AI/ML and software engineer.

Built on Next.js 16 (App Router), React 19, Tailwind CSS v4, and TypeScript.
Deployed on Vercel.

## Architecture

```text
Portfolio content          Blog content
(edited in code)           (edited in Hashnode)
       │                          │
       ▼                          ▼
  src/lib/content/           Hashnode GraphQL
  profile · projects              │
  experience · certs              ▼
  education · activities     src/lib/blog/
       │                     domain types + adapter
       │                          │
       └────────────┬─────────────┘
                    ▼
              React components
                    │
                    ▼
     /  ·  /work/[slug]  ·  /blogs  ·  /blogs/[slug]
```

Only the blog is CMS-managed. Everything else is edited in code and deployed. There is
no admin panel, by design.

- **Blog content** comes from Hashnode Headless CMS over GraphQL, behind an adapter in
  `src/lib/blog/`. No Hashnode type or query shape may leak above that boundary.
- **Comments and reactions** are Giscus (GitHub Discussions). Hashnode's API cannot
  accept either from a custom frontend.
- **Analytics** is Vercel Analytics, not Hashnode's — Hashnode never sees traffic
  rendered here.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

`.env.example` documents every variable and where to obtain it. `HASHNODE_ACCESS_TOKEN`
grants full write access to the publication — server-side only, never `NEXT_PUBLIC_`.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Notes

- **`/blogs`, not `/blog`.** The route is plural because the existing published
  articles rank at those URLs. Do not rename it, and do not change any post slug.
- Requires an active **Hashnode Pro** plan — the GraphQL API is paywalled, so the blog
  cannot fetch without it. A committed content snapshot provides the build-time
  fallback so a lapsed plan or an API outage cannot 404 the ranking URLs.
- Tailwind v4 is CSS-first. Tokens live in `src/app/globals.css`; there is no
  `tailwind.config.ts` and one should not be added.

## Credit

Originally scaffolded from [magicuidesign/portfolio](https://github.com/magicuidesign/portfolio)
(MIT), then substantially rebuilt. The upstream remote is retained locally as
`template-upstream`.
