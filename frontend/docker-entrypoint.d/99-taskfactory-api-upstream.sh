#!/bin/sh
set -e
# Upstream del API NestJS para location /api (misma red Docker que este contenedor).
# En Dokploy el servicio casi nunca se llama "backend". Ejemplos:
#   BACKEND_UPSTREAM=app:3000
#   BACKEND_UPSTREAM=taskfactory-app-lz4xlg:3000
#   TASKFACTORY_API_HOST=...
#   API_UPSTREAM=...
UPSTREAM="${BACKEND_UPSTREAM:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="${TASKFACTORY_API_HOST:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="${API_UPSTREAM:-}"
[ -z "$UPSTREAM" ] && UPSTREAM="app:3000"

if [ "$UPSTREAM" = "app:3000" ] && [ -z "${BACKEND_UPSTREAM:-}${TASKFACTORY_API_HOST:-}${API_UPSTREAM:-}" ]; then
  echo "[taskfactory-nginx] AVISO: usando app:3000 por defecto. Si /api devuelve 502, defina BACKEND_UPSTREAM con el hostname real del API en la red Docker (p. ej. app:3000 o el slug del servicio en Dokploy)." >&2
fi

awk -v u="$UPSTREAM" '{ gsub("__BACKEND_UPSTREAM__", u); print }' \
  /etc/nginx/taskfactory/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -t 2>&1 || {
  echo "[taskfactory-nginx] ERROR: nginx -t falló. Revise la plantilla y BACKEND_UPSTREAM." >&2
  exit 1
}

echo "[taskfactory-nginx] proxy /api -> http://${UPSTREAM}"

# Diagnóstico: si falla, en Dokploy el frontend y el API suelen estar en redes distintas
# (dos aplicaciones separadas). Solución: un solo Docker Compose (docker-compose.dokploy.yml)
# o enlazar redes / BACKEND_UPSTREAM al hostname real del contenedor API.
if command -v curl >/dev/null 2>&1; then
  if curl -fsS -m 5 "http://${UPSTREAM}/api/auth/setup-status" >/dev/null 2>&1; then
    echo "[taskfactory-nginx] comprobación: http://${UPSTREAM}/api responde (setup-status OK)"
  else
    echo "[taskfactory-nginx] ERROR: no hay conexión HTTP a http://${UPSTREAM}/api (causa habitual del 502)." >&2
    echo "[taskfactory-nginx] Revise: mismo proyecto Docker que el API, nombre de servicio correcto, API escuchando en :3000." >&2
  fi
fi

# URL absoluta del API (opción B: el navegador llama al API sin pasar por proxy Nginx).
# Ej.: API_PUBLIC_URL=https://api.taskfactory.app-sprint.com/api
DOCROOT="/usr/share/nginx/html"
if [ -n "${API_PUBLIC_URL:-}" ]; then
  URL=$(printf '%s' "$API_PUBLIC_URL" | sed 's|/*$||')
  B64=$(printf '%s' "$URL" | base64 | tr -d '\n')
  printf '%s\n' "window.__TASKFACTORY_API_BASE__ = (typeof atob !== 'undefined' ? atob('${B64}') : '/api');" > "${DOCROOT}/runtime-config.js"
  echo "[taskfactory-nginx] runtime-config.js: API_PUBLIC_URL definido (cliente HTTP hacia API público)" >&2
else
  printf '%s\n' "window.__TASKFACTORY_API_BASE__ = '/api';" > "${DOCROOT}/runtime-config.js"
fi
