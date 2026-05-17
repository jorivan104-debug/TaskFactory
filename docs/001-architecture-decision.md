# ADR-001: Architecture & Technology Stack

**Status:** Accepted  
**Date:** 2026-05-06  
**Last updated:** 2026-05-17  
**Author:** Engineering (automated from plan)

## Context

TaskFactory is a greenfield multi-plant production management platform replacing Zoho Creator. Requirements from the project charter:

- ~40 concurrent users at peak
- Mobile + PC access, always online
- UI in Spanish, codebase in English
- Multi-site (unlimited work sites and warehouses)
- Integrations: Zoho Books (accounting sync), email, WhatsApp (Lexi desconectado; catálogo manual de referencias)
- Lot/serial tracking from day one
- Audit trail on critical operations

## Decision

### Backend: NestJS + TypeScript

- **Framework:** NestJS 10+ with TypeScript strict mode
- **API style:** REST with OpenAPI/Swagger auto-documentation
- **Auth:** JWT (access + refresh tokens) with Passport strategies
- **RBAC:** Custom guards checking `user_roles` with optional `work_site_id` scope
- **Validation:** class-validator + class-transformer on all DTOs

### Database: PostgreSQL + Prisma

- **Engine:** PostgreSQL 16+
- **ORM:** Prisma with versioned migrations
- **Conventions:** UUID primary keys, `created_at`/`updated_at` timestamps, `created_by_user_id` FK on business tables, soft delete via `deleted_at` where required
- **Multi-site:** `work_site_id` and/or `warehouse_id` on operational tables

### Frontend: React + Vite + TailwindCSS

- **Framework:** React 19 with TypeScript
- **Build:** Vite
- **Routing:** React Router v7
- **State:** TanStack Query (server state) + Zustand (client state)
- **Styling:** TailwindCSS with design tokens from brand spec (`#F3F9FF`, `#007BFF`, etc.)
- **Components:** Headless UI + reusable `CatalogCrudPage` for settings catalogs
- **Workflow editor:** `@xyflow/react` for work order blueprint canvas (`/settings/work-order-types/:id/blueprint`)
- **Icons:** Lucide React (line style, rounded)

### Job Queue: BullMQ + Redis

- **Purpose:** Accounting sync retries (`accounting_sync_requests`), email/WhatsApp notifications
- **Dashboard:** Bull Board for monitoring failed jobs

### File Storage

- Local filesystem or S3-compatible (MinIO) for images/attachments
- URLs stored in DB columns (`image_url`, `garment_image_url_*`, `design_attachments_json`)

### Deployment: Dokploy

- **Staging/production:** single Docker Compose stack (`docker-compose.yml`) on Dokploy — see [006-dokploy-deployment.md](./006-dokploy-deployment.md)
- **Services:** `postgres`, `backend` (NestJS, `node dist/main.js`), `frontend` (Nginx + SPA, proxies `/api` to backend)
- **Routing:** Traefik → `frontend:80` on external `dokploy-network`; do not expose `backend:3000` as the public domain
- **Alternative compose:** `docker-compose.dokploy.yml` when PostgreSQL is hosted elsewhere (`DATABASE_URL` required)
- Local development: manual Node processes or partial Docker (see root `README.md`)
- Automated backups for PostgreSQL (operational; configure on server)

### Work order blueprints (2026-05)

- **Catalog:** `work_order_types` + `work_order_blueprints` (1:1), edited in settings, published after graph validation
- **Runtime:** `BlueprintEngineService` in `work-orders` module executes declarative transition actions (`set_field`, `append_log`, `complete_open_tasks`) and optional `TaskAssignment` on state entry
- **Immutability:** each `WorkOrder` stores `blueprint_snapshot_json` + `blueprint_version` at creation
- **Spec:** [007-work-order-blueprints.md](./007-work-order-blueprints.md)

### Simplified production model (2026-05-18)

- **Removed:** `developments` and `production_orders` tables/modules
- **Work order as main entity:** planning fields (production type, pattern supplier, design instructions) and execution fields (blueprint, state, close) all live on `work_orders`
- **Garment references:** manual catalog (`work_order_id` null) or 1:1 with OT; auto `code` (brand consecutivo + sequence + serie)
- **Size curve:** `work_order_size_curve_items` directly on the work order

## Consequences

- TypeScript end-to-end gives type safety across the stack
- Prisma migrations are version-controlled and reproducible
- NestJS module system maps cleanly to the 10 functional blocks in the roadmap
- TailwindCSS design tokens enforce visual consistency from the brand spec
- BullMQ handles retry logic for accounting sync with configurable backoff
