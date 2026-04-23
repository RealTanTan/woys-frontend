# WOYS — SMS Platform · Frontend

Canadian CASL-compliant SMS marketing platform.
Two portals: **Business** (send SMS, manage contacts) + **Admin** (manage all businesses, handle tickets).

> All data is mocked — no backend needed to run the UI.

---

## Quick Start

```bash
# 1. Install dependencies   ← do this first
npm install

# 2. Run dev server
npm run dev
```

Open **http://localhost:3000**

---

## Demo Login Credentials

| Portal | URL | Email | Password |
|--------|-----|-------|----------|
| Business | /login | arash@billiardbar.ca | demo123 |
| Admin | /admin/login | admin@woys.ca | admin123 |

---

## Packages Installed   (* install before running *)

```bash
npm install   # installs everything below automatically
```

| Package | What it does |
|---------|-------------|
| `next` 16 | Framework — pages, routing, server rendering |
| `react` + `react-dom` 19 | UI library |
| `tailwindcss` v4 | CSS utility classes (no separate CSS files) |
| `@tailwindcss/postcss` | Connects Tailwind to the build |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | Combine CSS class names cleanly |
| `date-fns` | Format dates |
| `typescript` | Type safety |
| `eslint` | Code linting |

---

## Connecting to the Backend

Every API call is in one file: **`src/lib/api.ts`**

Each function has a `// TODO: replace with fetch(...)` comment showing exactly what endpoint to call.

**Steps for backend dev:**
1. Copy `.env.local.example` → `.env.local`
2. Set `NEXT_PUBLIC_API_URL=https://your-api.com`
3. In `src/lib/api.ts`, replace each function body (remove the mock return, uncomment the `TODO` fetch call)
4. Add Clerk auth token to the `request()` helper at the top of the file

---

## Folder Structure

```
frontend/
│
├── src/
│   │
│   ├── app/                            ← All pages live here
│   │   │
│   │   ├── (business-login)/           ← Business sign-in page
│   │   │   └── login/page.tsx
│   │   │
│   │   ├── (business-portal)/          ← All business pages (sidebar included)
│   │   │   ├── layout.tsx              ← Wraps every business page with sidebar
│   │   │   ├── dashboard/page.tsx      ← Plan usage, stats, quick actions
│   │   │   ├── contacts/page.tsx       ← Contact list (All/Consented/Pending/Opted-Out)
│   │   │   ├── messages/page.tsx       ← SMS inbox
│   │   │   ├── messages/[id]/page.tsx  ← Single conversation thread
│   │   │   ├── broadcasts/page.tsx     ← Mass SMS campaigns list
│   │   │   ├── broadcasts/new/page.tsx ← Create broadcast + AI suggestions
│   │   │   ├── broadcasts/[id]/page.tsx← Broadcast analytics
│   │   │   ├── templates/page.tsx      ← Saved message templates
│   │   │   └── settings/page.tsx       ← Team, SMS/CASL config, billing
│   │   │
│   │   ├── (admin-login)/              ← Admin sign-in page (no sidebar)
│   │   │   └── admin/login/page.tsx
│   │   │
│   │   ├── (admin-portal)/             ← All admin pages (admin sidebar included)
│   │   │   ├── layout.tsx              ← Wraps every admin page with admin sidebar
│   │   │   └── admin/
│   │   │       ├── dashboard/page.tsx  ← All businesses overview
│   │   │       ├── businesses/page.tsx ← Business list with usage bars
│   │   │       ├── businesses/[id]/    ← Single business detail + actions
│   │   │       ├── tickets/page.tsx    ← Support tickets with chat threads
│   │   │       └── settings/page.tsx   ← Platform config
│   │   │
│   │   ├── globals.css                 ← Only CSS file (Tailwind import + brand colours)
│   │   ├── layout.tsx                  ← Root HTML shell (dark mode, fonts)
│   │   └── page.tsx                    ← Redirects / → /login
│   │
│   ├── components/
│   │   ├── ui/                         ← Reusable building blocks
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx               ← Also exports Textarea
│   │   │   ├── Modal.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Skeleton.tsx            ← Loading placeholders
│   │   │
│   │   ├── layout/                     ← App shell components
│   │   │   ├── Sidebar.tsx             ← Business portal sidebar
│   │   │   ├── AdminSidebar.tsx        ← Admin portal sidebar
│   │   │   ├── Topbar.tsx              ← Top header bar (page title + dark toggle)
│   │   │   └── ThemeProvider.tsx       ← Dark/light mode toggle logic
│   │   │
│   │   └── features/
│   │       └── TicketButton.tsx        ← Floating support button (bottom-right)
│   │
│   ├── lib/
│   │   ├── api.ts          ← ALL API calls live here — connect backend here
│   │   ├── mock-data.ts    ← Fake data used while there's no backend
│   │   ├── auth.ts         ← Mock login/logout (swap with Clerk when ready)
│   │   └── utils.ts        ← Helpers: cn(), formatDate(), smsCharCount()
│   │
│   └── types/
│       └── index.ts        ← All TypeScript types (Contact, Broadcast, Ticket…)
│
├── .env.local.example      ← Copy to .env.local and fill in API URL + Clerk keys
├── tailwind.config.ts      ← Brand colours (brand-50 … brand-950), dark mode
├── postcss.config.mjs      ← Required for Tailwind v4
├── next.config.ts          ← Next.js config
└── tsconfig.json           ← TypeScript config
```

---

## How Styling Works (no separate HTML/CSS files)

This is **React + Tailwind** — there are no `.html` files and only one `.css` file.

| What you expect | Where it actually is |
|-----------------|---------------------|
| HTML structure | Inside `.tsx` files as JSX (`<div>`, `<p>`, etc.) |
| CSS styles | Tailwind classes on each element: `className="bg-white rounded-xl p-4"` |
| Separate stylesheets | Only `globals.css` — defines brand colours and imports Tailwind |
| Dark mode | Adding `dark` class to `<html>` — handled by `ThemeProvider.tsx` |

---

## Build for Production

```bash
npm run build   # type-check + compile
npm start       # serve production build
```
