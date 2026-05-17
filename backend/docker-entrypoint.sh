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

# Migración que falló en staging por SQL inválido; el entrypoint puede marcarla rolled-back y reintentar.
GARMENT_CATALOG_MIGRATION="20260518120000_garment_references_catalog"
INVENTORY_SUPPLY_MIGRATION="20260518140000_inventory_supply_movements"
MIGRATE_LOG=$(mktemp)
trap 'rm -f "$MIGRATE_LOG"' EXIT

run_prisma_migrate_deploy() {
  set +e
  npx prisma migrate deploy >"$MIGRATE_LOG" 2>&1
  code=$?
  set -e
  cat "$MIGRATE_LOG"
  return "$code"
}

if [ "$SKIP_PRISMA_MIGRATE" = "1" ] || [ "$SKIP_PRISMA_MIGRATE" = "true" ]; then
  echo "[taskfactory] SKIP_PRISMA_MIGRATE está activo — no se ejecutará prisma migrate deploy"
else
  echo "[taskfactory] ejecutando: npx prisma migrate deploy"
  if ! run_prisma_migrate_deploy; then
    if grep -q 'P3009' "$MIGRATE_LOG"; then
      if grep -q "$GARMENT_CATALOG_MIGRATION" "$MIGRATE_LOG"; then
        echo "[taskfactory] P3009: $GARMENT_CATALOG_MIGRATION → rolled-back"
        npx prisma migrate resolve --rolled-back "$GARMENT_CATALOG_MIGRATION"
      elif grep -q "$INVENTORY_SUPPLY_MIGRATION" "$MIGRATE_LOG"; then
        echo "[taskfactory] P3009: $INVENTORY_SUPPLY_MIGRATION → rolled-back"
        npx prisma migrate resolve --rolled-back "$INVENTORY_SUPPLY_MIGRATION"
      else
        echo "[taskfactory] ERROR: migración fallida no reconocida para recuperación automática"
        exit 1
      fi
      echo "[taskfactory] reintentando: npx prisma migrate deploy"
      run_prisma_migrate_deploy || exit 1
    else
      echo "[taskfactory] ERROR: prisma migrate deploy falló"
      exit 1
    fi
  fi
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
