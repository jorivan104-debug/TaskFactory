# Despliegue en Dokploy

**Estado:** Validado en staging (`taskfactory.app-sprint.com`, mayo 2026)  
**Compose principal:** `docker-compose.yml` (postgres + backend + frontend en un solo stack)

## Arquitectura en producción

```
Internet → Traefik (Dokploy) → frontend:80 (Nginx)
                                    ├─ /        → SPA estática (Vite build)
                                    └─ /api/*   → proxy → backend:3000 (NestJS)
                                                      └─ postgres:5432
```

- El **dominio público** debe apuntar siempre al servicio **`frontend`**, puerto **80**. No expongas `backend:3000` como dominio principal.
- El backend escucha en `0.0.0.0:3000` y arranca con `node dist/main.js` (build de producción vía `tsconfig.build.json`).
- Nginx resuelve el API con `BACKEND_UPSTREAM=backend:3000` (variable en compose).

## Archivos Compose

| Archivo | Uso |
|---------|-----|
| `docker-compose.yml` | **Recomendado en Dokploy.** Postgres interno, red `dokploy-network`, labels Traefik en `frontend`. |
| `docker-compose.dokploy.yml` | Stack sin Postgres (`api` + `web`); usar solo si la base de datos vive en otro servicio y defines `DATABASE_URL` externa. |

## Variables de entorno (Dokploy)

Obligatorias para `docker-compose.yml`:

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_PASSWORD` | Contraseña del usuario `postgres`. |
| `JWT_SECRET` | Secreto para firmar JWT. |

Recomendadas:

| Variable | Ejemplo |
|----------|---------|
| `FRONTEND_URL` | `https://taskfactory.app-sprint.com` |
| `TASKFACTORY_HOST` | `taskfactory.app-sprint.com` (host en reglas Traefik del compose) |
| `JWT_EXPIRATION` | `1d` |

Opcionales (WorkOS): `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_REDIRECT_URI` (debe incluir `/api/auth/workos/callback`).

Opcionales (entrypoint backend):

| Variable | Efecto |
|----------|--------|
| `SKIP_PRISMA_MIGRATE=1` | Omite `prisma migrate deploy` (solo emergencia). |
| `RUN_SEED_ON_START=1` | Ejecuta `prisma db seed` al arrancar. |

`DATABASE_URL` se genera en el compose:  
`postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/taskfactory-db?schema=public`

## Configuración en Dokploy (paso a paso)

1. **Aplicación** → tipo **Docker Compose** → repositorio GitHub → rama `main` (o la que uses).
2. **Compose path:** `./docker-compose.yml`
3. **Environment:** define las variables de la tabla anterior.
4. **Dominio (importante):** el `docker-compose.yml` incluye **labels Traefik** en `frontend`. Elige **una** de estas opciones:
   - **Opción A (actual):** no añadas dominios duplicados en la pestaña **Domains** de Dokploy; el routing lo hacen los labels del compose.
   - **Opción B:** quita los `labels:` de `frontend` en el repo y configura en **Domains** → servicio `frontend`, puerto `80`, HTTPS activo.
5. **Advanced:** no uses **Ports** en el host (`80:80`, `3000:3000`); Traefik enruta al puerto interno del contenedor.
6. **Deploy** con rebuild sin caché tras cambios en Dockerfiles (`backend` / `frontend`).

DNS: registro **A** de `TASKFACTORY_HOST` hacia la IP del servidor antes de solicitar certificado Let's Encrypt.

## Red Docker

Todos los servicios del stack están en la red externa **`dokploy-network`** (creada por Dokploy). Traefik y los contenedores deben compartir esa red para evitar **502 Bad Gateway**.

## Verificación post-deploy

### Logs del backend

Debe aparecer:

```text
[taskfactory] ejecutando: npx prisma migrate deploy
[taskfactory] iniciando la API NestJS...
Nest application successfully started
```

No debe aparecer `Cannot find module '/app/dist/main'` ni arranque por `nest start` en producción.

### Logs del frontend

```text
[taskfactory-nginx] proxy /api -> http://backend:3000
[taskfactory-nginx] comprobación: http://backend:3000/api responde (setup-status OK)
```

### URLs

- App: `https://<TASKFACTORY_HOST>/`
- API (vía proxy): `https://<TASKFACTORY_HOST>/api/...`
- Swagger (si está expuesto): `https://<TASKFACTORY_HOST>/api/docs`

## Problemas frecuentes

| Síntoma | Causa habitual | Acción |
|---------|----------------|--------|
| **502 Bad Gateway** en `/` | Dominio apunta a `backend:3000` o puerto incorrecto | Dominio solo a `frontend:80`, o labels Traefik en `frontend` |
| **502** en `/api` | `frontend` y `backend` en redes distintas | Un solo compose; todos en `dokploy-network`; `BACKEND_UPSTREAM=backend:3000` |
| Dominio + labels duplicados | Conflicto Traefik | Usar solo Opción A o B de dominio |
| `dist/main.js` no existe | Imagen sin build | `docker compose build --no-cache backend` |
| WorkOS redirect falla | URI distinta al panel | `WORKOS_REDIRECT_URI` = URL pública exacta con prefijo `/api` |
| **P3009** / backend **unhealthy** | Migración fallida en `_prisma_migrations` | Ver [Migración fallida (P3009)](#migración-fallida-p3009) |

### Migración fallida (P3009)

Si el log muestra `migrate found failed migrations` y `20260518120000_garment_references_catalog ... failed`:

1. **Despliega** el commit que corrige el SQL de esa migración (el `UPDATE` de marcas debe usar subconsulta `FROM`, no `ROW_NUMBER()` en el `SET`).
2. En el servidor, con el stack levantado (al menos `postgres` + un contenedor con Prisma):

```bash
cd /etc/dokploy/compose/<tu-compose>/code   # ruta del clone en Dokploy
docker compose -p taskfactory-compose-4rodzf exec backend \
  npx prisma migrate resolve --rolled-back 20260518120000_garment_references_catalog
```

3. **Redeploy** (rebuild backend) para que `prisma migrate deploy` vuelva a ejecutar la migración corregida.

Si el contenedor `backend` no arranca, usa un one-off:

```bash
docker compose -p taskfactory-compose-4rodzf run --rm backend \
  npx prisma migrate resolve --rolled-back 20260518120000_garment_references_catalog
```

> La migración corregida elimina referencias de catálogo Lexi sin `brand_id` y rellena `code` / `serie` en las filas restantes antes de quitar columnas `source` y `lexi_external_id`.

## Build local de imágenes (referencia)

```bash
docker compose build --no-cache backend frontend
docker compose up -d
```

Para desarrollo local sin Dokploy, usa solo los servicios de datos o el flujo manual descrito en el `README.md` raíz.
