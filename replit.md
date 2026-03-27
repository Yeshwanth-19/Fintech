# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── gfolio-admin/       # Gfolio Admin & Corporate Portal (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Gfolio Admin & Corporate Portal

A full-stack admin dashboard for the Gfolio.in investment gifting platform.

### Branding
- Dark theme: `#0A0A0A` background
- Primary: `#F59E0B` (amber/gold)
- Font: Plus Jakarta Sans

### Pages
- `/` — Admin Dashboard (KPIs, alerts, charts)
- `/users` — User Management (table, KYC filters)
- `/users/:id` — User Profile (KYC, holdings, transactions)
- `/gifts` — Gifting Operations
- `/transactions` — Transaction Management
- `/corporate/campaigns` — Corporate Campaign Portal
- `/corporate/wallet` — Wallet & Budget
- `/notifications` — Notification Templates + Logs
- `/reports` — Analytics & Reports

### Role-Based Access
- Super Admin, Ops Admin, Finance Admin, Corporate Admin

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with routes for all Gfolio admin features. Uses mock/seed data (no DB currently).

Routes:
- Dashboard metrics, alerts, transaction trends
- Users CRUD + KYC management
- Gift orders management
- Transaction management (retry, refund)
- Campaigns + wallet
- Notifications + delivery logs
- Reports (distribution, redemption)

### `artifacts/gfolio-admin` (`@workspace/gfolio-admin`)

React + Vite frontend admin portal. Uses:
- `recharts` for charts
- `framer-motion` for animations
- `@tanstack/react-query` for data fetching
- `wouter` for routing
- Shadcn/ui components

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Schema is currently empty (mock data in routes).

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec for all Gfolio admin APIs. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
