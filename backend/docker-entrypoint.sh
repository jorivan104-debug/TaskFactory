#!/bin/sh
set -e

# TaskFactory backend — arranque en Docker/Dokploy
# Variables opcionales:
#   SKIP_PRISMA_MIGRATE=1  — omite migrate deploy (solo emergencia / depuración)
#   RUN_SEED_ON_START=1    — ejecuta `prisma db seed` tras migrate (admin y datos base)

echo "[taskfactory] entrypoint: starting"

if [ -z "$DATABASE_URL" ]; then
  echo "[taskfactory] ERROR: DATABASE_URL no está definida. El contenedor no puede arrancar."
  exit 1
fi

if [ "$SKIP_PRISMA_MIGRATE" = "1" ] || [ "$SKIP_PRISMA_MIGRATE" = "true" ]; then
  echo "[taskfactory] SKIP_PRISMA_MIGRATE está activo — no se ejecutará prisma migrate deploy"
else
  echo "[taskfactory] ejecutando: npx prisma migrate deploy"
  npx prisma migrate deploy
fi

if [ "$RUN_SEED_ON_START" = "1" ] || [ "$RUN_SEED_ON_START" = "true" ]; then
  echo "[taskfactory] RUN_SEED_ON_START: ejecutando prisma db seed"
  if npx prisma db seed; then
    echo "[taskfactory] seed OK — usuario por defecto (semilla): jorivan104@hotmail.com / e7sacxtf"
  else
    echo "[taskfactory] ERROR: prisma db seed falló. Revise logs arriba; use la pantalla «Primera instalación» o corrija DATABASE_URL / migraciones."
  fi
fi

echo "[taskfactory] iniciando la API NestJS..."
if [ ! -f dist/main.js ]; then
  echo "[taskfactory] ERROR: falta dist/main.js — la imagen no incluye el build de producción."
  echo "[taskfactory] Reconstruya sin caché: docker compose build --no-cache backend"
  exit 1
fi
exec node dist/main.js
