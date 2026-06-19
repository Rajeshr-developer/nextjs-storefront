# Storefront Admin — Next.js + Prisma + Supabase

A full-stack admin dashboard built to learn Next.js App Router end-to-end.

## Stack
- **Next.js 15** — App Router, Server Components, Server Actions
- **Prisma** — Type-safe ORM
- **Supabase PostgreSQL** — Database
- **Recharts** — Charts on dashboard
- **Tailwind CSS** — Utility styling

## Features
- Dashboard with live stats + charts
- Users CRUD (create, read, update, delete)
- Products CRUD with stock management
- Orders management with status updates

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Supabase password to .env
```bash
# .env
DATABASE_URL="postgresql://postgres.xieulvarrpovljyjmaon:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xieulvarrpovljyjmaon:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 3. Generate Prisma client
```bash
npx prisma generate
```

### 4. Run
```bash
npm run dev
```

Open http://localhost:3000

## Project Structure
```
app/
├── page.tsx              ← Dashboard (Server Component)
├── layout.tsx            ← Root layout with Sidebar
├── users/
│   ├── page.tsx          ← Server Component (fetches data)
│   ├── UsersClient.tsx   ← Client Component (CRUD UI)
│   └── actions.ts        ← Server Actions (DB mutations)
├── products/             ← Same pattern
└── orders/               ← Same pattern + relational data
components/
├── Sidebar.tsx           ← Client Component (navigation)
└── DashboardCharts.tsx   ← Client Component (Recharts)
lib/
└── prisma.ts             ← Prisma singleton
prisma/
└── schema.prisma         ← DB models
```

## Key Next.js Concepts Demonstrated
| Concept | Where |
|---|---|
| Server Components | All page.tsx files |
| Client Components | *Client.tsx files |
| Server Actions | actions.ts files |
| Parallel data fetching | orders/page.tsx |
| Prisma singleton | lib/prisma.ts |
| revalidatePath | After every mutation |
| Streaming ready | loading.tsx can be added per route |
