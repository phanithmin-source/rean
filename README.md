# Rean (រៀន)

> Public software development learning and resource platform with a private editorial Admin site.

Rean helps students and early-career software engineers in Cambodia and worldwide discover curated software resources, follow disciplined learning paths, and build portfolio-grade practice projects.

---

## 🎨 Brand & Design System

Rean follows a calm editorial aesthetic with light reading surfaces, generous spacing, and accessible typography.

- **Color Palette**:
  - **Slate Navy** (`#343D4F`): Primary typography, primary buttons, and dark contrast surfaces.
  - **Soft Sage** (`#A8C8B2`): Main book outline, center fold, and positive progression accents.
  - **Pale Cyan** (`#BCE5E8`): Outer book outline and coding symbols (`< >`, `{ }`, `//`, `;`).
  - **Off-White / Cream** (`#F7F5EE`): Calm reading surface background.
- **Typography**:
  - **Geist**: Clean, modern interface and sans-serif typography.
  - **Noto Sans Khmer**: Native Khmer script support (`រៀន`).
  - **IBM Plex Mono**: High-legibility code blocks with syntax highlighting.
- **Brand Logo**:
  - An icon-only coding book rendered on slate navy with soft sage spine and pale cyan code markers, paired with high-resolution brand assets.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) mapped to shadcn/ui semantic CSS variables
- **Database**: PostgreSQL (with embedded `@electric-sql/pglite` fallback for zero-config local development, and standard `pg` connection pool support for external production databases)
- **Markdown & Syntax Highlighting**: `marked` + `highlight.js` + `sanitize-html` (XSS-sanitized)
- **Authentication**: Secure HTTP-only cookies with signed `jose` JWT session tokens and `bcryptjs` password hashing
- **File Storage**: Persistent storage in `public/uploads` with database metadata tracking in `assets` table

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.17.0+` (tested on Node v22)
- **npm** (or pnpm / yarn)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Migrations
Creates the PostgreSQL schema (topics, resources, chapters, learning paths, pages, navigation, assets, admins, site settings):
```bash
npm run db:migrate
```

### 4. Seed Launch Content
Seeds the 5 core learning domains, launch resources (including the flagship Java guide with 5 chapters, downloadable PDF, and Study Session Tracker source code), learning paths, navigation, and default admin:
```bash
npm run db:seed
```
> **Note**: The seed script is completely idempotent and preserves existing editorial changes when rerun.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Admin Access Setup

- **Admin Login Route**: [`/admin/login`](http://localhost:3000/admin/login)
- **Admin Dashboard**: [`/admin`](http://localhost:3000/admin)
- **Default Seeded Credentials**:
  - **Email**: `admin@rean.dev`
  - **Password**: `AdminPassword123!`

---

## ⚙️ Environment Variables

Copy or configure the following variables in `.env.local` or your production environment:

| Variable | Description | Default / Example |
| --- | --- | --- |
| `DATABASE_URL` | Optional PostgreSQL connection string. When omitted, Rean automatically uses persistent disk storage at `./data/rean-pgdata` via PGlite. | `postgresql://postgres:password@localhost:5432/rean` |
| `ADMIN_JWT_SECRET` | Secret key used to sign and verify administrative session tokens. | `rean-secure-editorial-secret-key-salt-2026` |
| `PORT` | Local server port. | `3000` |

---

## 📖 Public Platform Routes

1. **Explore (`/`)**
   - Editable hero title and intro copy.
   - Prominent search bar with real-time filtering across title, summary, markdown description, topics, and tags.
   - Topic pills, format filter dropdown (Book, Guide, Course, Tool, Doc, Project), and difficulty filter (Beginner, Intermediate, Advanced).
   - Filter state synced to URL parameters (`?q=...&topic=...&type=...&difficulty=...`) for shareable search links.
   - Result counts, clear-filters action, and helpful empty state.
   - Featured topics grid and curated picks highlights.
2. **Topics (`/topics/[slug]`)**
   - Topic overview and description.
   - Published resources and structured learning paths belonging to the topic.
   - Seeded topics: **Programming**, **Frontend**, **Backend**, **Databases**, **Developer Tools**.
3. **Resource Details (`/resources/[slug]`)**
   - Explains what the resource covers, who it is for, and when to use it.
   - Applicable action buttons: Read Online, Download Files (PDF / ZIP source), View Source, or External Documentation.
   - Download actions appear **only** when physical assets exist on storage.
   - Interactive chapter index for multi-chapter books.
   - Private preview support (`?preview=true`) for logged-in editors.
4. **Chapter Reader (`/resources/[slug]/[chapter]`)**
   - Distraction-free reading surface with syntax-highlighted code.
   - Code blocks with horizontal scroll (`overflow-x-auto`) for long lines.
   - Chapter table of contents sidebar, chapter progress indicator, and previous/next chapter navigation.
5. **Learning Paths (`/paths` and `/paths/[slug]`)**
   - Seeded paths: **Programming Foundations** and **Backend Foundations**.
   - Shows target outcome, prerequisites, ordered lessons with resource links and study durations.
   - Capstone practice task (e.g., *Study Session Tracker REST API* and *CLI Task Organizer*).
6. **About (`/about`)**
   - Explains Rean's mission, audience, learning approach, and resource selection criteria.
   - Fully editable from the Admin site.
   - Strict omission of founder/developer profiles or personal attribution.

---

## 🔒 Admin Site & Publishing Lifecycle

The Admin site at `/admin` empowers editors to update all public-facing editorial content directly from the browser without code changes or redeployments:

- **Topics**: Manage names, slugs, descriptions, icons, display orders, and visibility.
- **Resources**: Manage titles, summaries, markdown descriptions, format types, difficulty levels, topic associations, tags, external links, curation notes, download asset attachments, and homepage featured placement.
- **Books & Chapters**: Full Markdown editor with syntax highlighting, chapter ordering, and reader linking.
- **Learning Paths**: Manage roadmaps, outcomes, prerequisites, ordered lessons, resource associations, and capstone tasks.
- **Explore Homepage**: Edit hero headlines, subheadings, and section titles.
- **About Page**: Edit mission, audience, pedagogy, criteria, and call-to-action buttons.
- **Navigation & Footer**: Manage menu labels, destinations, display ordering, and footer copyright copy.
- **Media & Downloads**: Upload, inspect, replace, and delete PDFs, archives, and images. Enforces dependency checking to show where assets are used before deletion.
- **Site Settings & SEO**: Manage site name, global description, logo, favicon, social image, and page-level SEO meta tags.

### Draft Isolation & Publishing State
- **Draft Revisions**: When editors save changes, they are stored in draft state (`has_draft_changes = true`).
- **Live Version Preserved**: The last published version remains live and unchanged on public pages until the editor clicks **Publish**.
- **Private Previews**: Editors can preview draft content before publishing via authenticated `?preview=true` queries.
- **Atomic Publishing**: Clicking **Publish** updates live fields, resets draft flags, updates timestamps, and triggers Next.js cache revalidation.
- **Integrity Guards**: The system prevents deleting topics or assets currently in use, and blocks unpublishing resources required by active learning paths.

---

## 🧪 Automated Verification Suite

Run the full end-to-end verification test suite:
```bash
npm run verify
```
This executes **32 automated checks** covering:
- Database connectivity, schema tables, and seed idempotency
- Full-text catalog search and multi-facet filtering
- Shared URL state restoration
- Chapter reader rendering with syntax highlighting
- Admin resource creation, draft saving, and live publishing
- Draft isolation (unpublished edits remaining private while live copy stays visible)
- Private preview route verification
- Omission of founder profiles on About page
- Dynamic navigation link modification
- Admin authentication and JWT token security
- Integrity blocks preventing deletion of in-use topics and assets
- Physical PDF and ZIP download validation

---

## 📦 Build & Production Deployment

### Production Typecheck & Lint
```bash
npm run lint
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Docker Deployment
Rean is server-capable and can be packaged into a standard Node.js Docker container:
```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 📄 License
Dedicated to software craftsmanship, open educational resources, and student empowerment.
