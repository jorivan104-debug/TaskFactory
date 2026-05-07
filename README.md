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
├── Cerebro/          # Business documentation (Obsidian)
├── docs/             # Architecture decisions & contracts
├── backend/          # NestJS API + Prisma
├── frontend/         # React SPA (Vite + Tailwind)
└── docker-compose.yml
```

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React, Vite, TailwindCSS |
| Backend   | NestJS, TypeScript       |
| Database  | PostgreSQL, Prisma       |
| Queue     | BullMQ, Redis            |
| Deploy    | Docker, Dokploy          |
