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
