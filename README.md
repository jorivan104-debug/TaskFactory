# TaskFactory

Plataforma multiplanta de gestión de producción.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Development (with Docker)

```bash
docker compose up -d postgres redis
cd backend && npm install && npx prisma migrate dev && npm run start:dev
cd frontend && npm install && npm run dev
```

### Development (manual)

1. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # configure DATABASE_URL
   npx prisma migrate dev
   npx prisma db seed
   npm run start:dev       # http://localhost:3000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev             # http://localhost:5173
   ```

### API Documentation

Swagger UI available at `http://localhost:3000/api/docs` when the backend is running.

## Despliegue (Dokploy)

Staging/producción se despliega como **una aplicación Docker Compose** en [Dokploy](https://dokploy.com), usando `docker-compose.yml` (Postgres + API + frontend con Nginx).

- URL de referencia: `https://taskfactory.app-sprint.com`
- Traefik enruta al servicio **`frontend:80`**; las peticiones `/api` las proxifica Nginx hacia **`backend:3000`**.
- Guía completa, variables de entorno y resolución de 502: **[docs/006-dokploy-deployment.md](docs/006-dokploy-deployment.md)**

Variables mínimas en el panel de Dokploy: `POSTGRES_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `TASKFACTORY_HOST`.

## Autenticación con WorkOS AuthKit

TaskFactory puede usar [WorkOS AuthKit](https://workos.com/docs/user-management) como inicio de sesión hospedado (SSO, magic link y password). Cuando está habilitado, la pantalla de login muestra el botón **Continuar con WorkOS** y oculta el formulario local.

### Variables de entorno (backend)

```
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=https://taskfactory.app-sprint.com/api/auth/workos/callback
FRONTEND_URL=https://taskfactory.app-sprint.com
```

### Configuración en el panel de WorkOS

1. Crea una aplicación en WorkOS y activa **AuthKit**.
2. En **Redirect URIs** agrega exactamente la misma URL configurada en `WORKOS_REDIRECT_URI` (incluye el prefijo `/api`).
3. Copia `WORKOS_API_KEY` y `WORKOS_CLIENT_ID` y ponlos en las variables de entorno del backend.
4. Define el dominio público en `FRONTEND_URL`; el backend redirige allí tras autenticar.

### Comportamiento

- El correo del usuario que autentica en WorkOS debe existir previamente en la tabla `users` (creada por `prisma db seed` o por la "Primera instalación"). Si no existe, el backend redirige al `/login` con un mensaje pidiendo que un administrador lo invite.
- Si las variables `WORKOS_*` quedan vacías, el endpoint `/api/auth/workos/status` devuelve `enabled: false` y el frontend muestra el formulario clásico de correo y contraseña.

## Project Structure

```
TaskFactory/
├── Cerebro/                    # Documentación de negocio (Obsidian)
│   ├── Acta de constitución del proyecto.md
│   ├── Estructura de base de datos.md
│   ├── Roadmap del proyecto.md
│   └── ...
├── docs/                       # ADR, contratos e implementación
│   ├── 001-architecture-decision.md
│   ├── 002-domain-gaps-resolution.md
│   ├── 006-dokploy-deployment.md
│   ├── 007-work-order-blueprints.md
│   └── ...
├── backend/                    # NestJS API + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── auth/               # JWT + WorkOS AuthKit
│       ├── work-sites/         # Plantas
│       ├── warehouses/         # Almacenes
│       ├── roles/
│       ├── brands/
│       ├── silhouettes/        # Siluetas + categorías
│       ├── pantone-colors/
│       ├── sizes/
│       ├── units-of-measure/
│       ├── supply-types/
│       ├── work-order-types/   # Tipos de OT + blueprints
│       ├── work-orders/        # OT (entidad principal) + motor de flujo + ref. + curva
│       ├── garment-references/ # Catálogo referencias (CRUD + preview ID)
│       ├── employees/          # Personal + TaskAssignment
│       ├── purchasing/         # Compras de insumo
│       ├── inventory/
│       ├── internal-orders/
│       ├── shipments/
│       ├── suppliers/
│       ├── supplies/
│       ├── accounting-sync/
│       └── ...
├── frontend/                   # React SPA (Vite + Tailwind)
│   └── src/
│       ├── pages/
│       │   ├── settings/       # CRUD catálogos + editor blueprint (React Flow)
│       │   ├── WorkOrdersPage.tsx
│       │   ├── WorkOrderDetailPage.tsx
│       │   └── GarmentReferencesPage.tsx  # Catálogo referencias
│       └── components/settings/  # CatalogCrudPage reutilizable
├── docker-compose.yml          # Dokploy: postgres + backend + frontend
└── docker-compose.dokploy.yml  # API + web (DB externa)
```

## Documentación técnica (`docs/`)

| Documento | Contenido |
|-----------|-----------|
| [001-architecture-decision.md](docs/001-architecture-decision.md) | Stack y decisiones de arquitectura |
| [002-domain-gaps-resolution.md](docs/002-domain-gaps-resolution.md) | Entidades de dominio y decisiones abiertas |
| [003-lexi-contract.md](docs/003-lexi-contract.md) | Lexi (histórico; catálogo manual activo) |
| [004-accounting-sync-contract.md](docs/004-accounting-sync-contract.md) | Sincronización contable |
| [005-test-plan.md](docs/005-test-plan.md) | Plan de pruebas y smoke tests |
| [006-dokploy-deployment.md](docs/006-dokploy-deployment.md) | Despliegue Dokploy / Traefik |
| [007-work-order-blueprints.md](docs/007-work-order-blueprints.md) | Tipos de OT, blueprints, motor de estados |

Modelo relacional detallado (tablas y columnas): **[Cerebro/Estructura de base de datos.md](Cerebro/Estructura%20de%20base%20de%20datos.md)**.

## Estado de implementación (resumen)

| Área | Estado |
|------|--------|
| Auth (JWT + WorkOS opcional) | Implementado |
| Configuración — catálogos CRUD | Plantas, almacenes, roles, marcas, siluetas, tallas, colores, unidades/tipos insumo, **tipos de OT** |
| Blueprints de flujo (canvas) | Editor React Flow + API publicar/borrador; motor en runtime de OT |
| Órdenes de trabajo | Entidad principal: referencia de prenda 1:1, curva de tallas, transiciones, bitácora |
| Referencias | Catálogo manual: crear/editar/desactivar, ID automático (marca + secuencia + serie) |
| Compras, inventario, etc. | API base / UI según módulo (ver roadmap) |
| Despliegue staging | Dokploy + `taskfactory.app-sprint.com` |

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 19, Vite, TailwindCSS, TanStack Query, React Router, **@xyflow/react** (editor blueprint) |
| Backend   | NestJS, TypeScript, Prisma |
| Database  | PostgreSQL, Prisma       |
| Queue     | BullMQ, Redis (previsto)   |
| Deploy    | Docker, Dokploy, Traefik |
