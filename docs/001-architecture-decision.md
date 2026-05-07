# ADR-001: Architecture & Technology Stack

**Status:** Accepted
**Date:** 2026-05-06
**Author:** Engineering (automated from plan)

## Context

TaskFactory is a greenfield multi-plant production management platform replacing Zoho Creator. Requirements from the project charter:

- ~40 concurrent users at peak
- Mobile + PC access, always online
- UI in Spanish, codebase in English
- Multi-site (unlimited work sites and warehouses)
- Integrations: Lexi (API/webhooks), Zoho Books (accounting sync), email, WhatsApp
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

- **Framework:** React 18+ with TypeScript
- **Build:** Vite
- **Routing:** React Router v6
- **State:** TanStack Query (server state) + Zustand (client state)
- **Styling:** TailwindCSS with design tokens from brand spec (`#F3F9FF`, `#007BFF`, etc.)
- **Components:** Headless UI + custom component library matching Concepto Grafico
- **Icons:** Lucide React (line style, rounded)

### Job Queue: BullMQ + Redis

- **Purpose:** Accounting sync retries (`accounting_sync_requests`), email/WhatsApp notifications
- **Dashboard:** Bull Board for monitoring failed jobs

### File Storage

- Local filesystem or S3-compatible (MinIO) for images/attachments
- URLs stored in DB columns (`image_url`, `garment_image_url_*`, `design_attachments_json`)

### Deployment: Dokploy

- Docker Compose for local dev (backend, frontend, postgres, redis)
- Dokploy on internal server for staging/production
- Automated backups for PostgreSQL

## Consequences

- TypeScript end-to-end gives type safety across the stack
- Prisma migrations are version-controlled and reproducible
- NestJS module system maps cleanly to the 10 functional blocks in the roadmap
- TailwindCSS design tokens enforce visual consistency from the brand spec
- BullMQ handles retry logic for accounting sync with configurable backoff
