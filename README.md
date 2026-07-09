# NS Knowledge Base

An enterprise-grade **Knowledge Management System** for hosting policies, procedures
and internal know-how. Built with the Next.js App Router, Supabase, TailwindCSS and
shadcn-style components.

> **Access model:** no user accounts. The **whole site is gated by an IP allowlist**,
> and the **admin dashboard** is additionally protected by a **shared passcode**.
> Personal engagement (views, likes) is aggregated globally; bookmarks are stored
> per-device in the browser.

---

## ✨ Features

**Public site**
- Modern homepage — hero + instant search, hot topics, categories, featured / most-viewed / latest / recently-updated, trending searches, "request a topic" CTA, live statistics.
- Full-text search (Postgres `tsvector`) with category filter, sorting and instant suggestions.
- Global command palette (`⌘/Ctrl + K`).
- Category browse pages and rich article pages (breadcrumbs, reading time, related articles, like / bookmark / copy-link / print / share, JSON-LD schema).
- Dark / light / system theme, fully responsive, PWA-ready.

**Admin dashboard** (`/admin`, passcode-protected)
- Overview with live stats, content-by-category chart and recent activity.
- Articles: create / edit (Tiptap rich-text editor), publish / draft / archive, feature, pin, duplicate, delete, slug generator, version snapshots.
- Categories: create / edit / delete, icon & color pickers, active toggle.
- Hot topics, tags, topic-request moderation (approve / reject / convert to draft), analytics, settings.

## 🧱 Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS + CSS variables |
| Components | shadcn-style (Radix primitives) |
| Icons | lucide-react |
| Animation | Framer Motion / CSS |
| Editor | Tiptap |
| Charts | Recharts |
| Database / Storage | Supabase (Postgres, RLS, Storage) |

## 📁 Project structure

```
src/
├─ app/
│  ├─ (public)/           # public site (navbar/footer layout)
│  │  ├─ page.tsx         # homepage
│  │  ├─ categories/      # list + [slug]
│  │  ├─ articles/[slug]/ # article detail
│  │  ├─ search/ trending/ submit/
│  └─ admin/
│     ├─ login/           # passcode gate
│     └─ (dashboard)/     # guarded admin shell + modules
├─ components/            # ui/ primitives + shared components
├─ features/              # feature modules (search, article, home, admin, editor, topics)
├─ services/              # server-side data access (reads)
├─ actions/               # server actions (writes / engagement / auth)
├─ lib/
│  ├─ access/             # IP allowlist + signed admin-session cookie
│  └─ supabase/           # client / server / admin (service-role) clients
├─ types/                 # database + domain types
└─ middleware.ts          # edge gate (IP allowlist + admin passcode)
supabase/migrations/      # 0001 schema · 0002 RLS · 0003 functions · 0004 seed
```

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project
1. Create a project at <https://app.supabase.com>.
2. Open **SQL Editor** and run the migrations **in order**:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_functions.sql`
   - `supabase/migrations/0004_seed.sql` (optional demo data)
3. (Optional) Create a public Storage bucket named `media` for uploaded images.

### 3. Configure environment
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).
- `ALLOWED_IPS` — comma-separated IPs / CIDR ranges allowed to reach the site. **Leave empty to allow everyone (dev only).**
- `ADMIN_PASSCODE` — the shared passcode for the admin dashboard.
- `ADMIN_SESSION_SECRET` — any long random string (signs the admin cookie).

### 4. Run
```bash
npm run dev       # http://localhost:3000
```
Admin dashboard: <http://localhost:3000/admin> → enter the passcode.

## 🔐 How access control works

1. **`src/middleware.ts`** runs on every request. It resolves the client IP
   (`X-Forwarded-For` when `TRUST_PROXY=true`) and blocks anything not on
   `ALLOWED_IPS` with a 403 page.
2. Requests to `/admin/*` also require a valid **`ns_admin_session`** cookie — an
   HMAC-signed, 12-hour token issued only after the passcode is verified
   (`src/actions/admin-auth.ts`). Implemented with Web Crypto so it runs at the edge.
3. **Row Level Security** is defense-in-depth: the anon key can only read published
   content; every write uses the **service-role** key inside guarded server actions.

> Behind a proxy/CDN (Vercel, Cloudflare, nginx), make sure the real client IP is
> forwarded and keep `TRUST_PROXY=true`. If you expose the app directly, put it
> behind a trusted proxy — `X-Forwarded-For` can be spoofed otherwise.

## 🧩 Extending

- **New admin module:** add a service in `services/admin.ts`, an action in `actions/`, a page under `app/admin/(dashboard)/`, and a `ADMIN_NAV` entry in `lib/constants.ts`.
- **Image uploads:** wire a Supabase Storage uploader into the article editor (bucket `media`).
- **AI-ready:** the schema keeps `content_text` and keywords per article — add a `pgvector` column + embeddings for semantic search later.

## 📜 Scripts
```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

---

Internal use only. Not intended to be publicly indexed (`robots` disallows all).
