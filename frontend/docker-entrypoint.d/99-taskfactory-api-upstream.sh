#!/bin/sh
set -e
# Upstream del API NestJS para location /api (misma red Docker que este contenedor).
# En Dokploy el servicio casi nunca se llama "backend". Ejemplos:
#   BACKEND_UPSTREAM=taskfactory-app-lz4xlg:3000
#   TASKFACTORY_API_HOST=taskfactory-app-lz4xlg:3000
#   API_UPSTREAM=taskfactory-app-lz4xlg:3000
UPSTREAM="${BACKEND_UPSTREAM:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="${TASKFACTORY_API_HOST:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="${API_UPSTREAM:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="backend:3000"

if [ "$UPSTREAM" = "backend:3000" ]; then
  echo "[taskfactory-nginx] AVISO: usando backend:3000. Si /api devuelve 502, defina BACKEND_UPSTREAM con el nombre del servicio del API en Dokploy (p. ej. taskfactory-app-lz4xlg:3000)." >&2
fi

awk -v u="$UPSTREAM" '{ gsub("__BACKEND_UPSTREAM__", u); print }' \
  /etc/nginx/taskfactory/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -t 2>&1 || {
  echo "[taskfactory-nginx] ERROR: nginx -t falló. Revise la plantilla y BACKEND_UPSTREAM." >&2
  exit 1
}

echo "[taskfactory-nginx] proxy /api -> http://${UPSTREAM}"
