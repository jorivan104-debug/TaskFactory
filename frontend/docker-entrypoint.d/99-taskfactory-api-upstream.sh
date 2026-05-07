#!/bin/sh
set -e
# Sustituye marcador sin envsubst (evita problemas con $$ y orden de entrypoint).
# Dokploy: BACKEND_UPSTREAM=nombre-servicio-api:3000 (misma red Docker que el frontend)
UPSTREAM="${BACKEND_UPSTREAM:-backend:3000}"
sed "s|__BACKEND_UPSTREAM__|${UPSTREAM}|g" /etc/nginx/taskfactory/default.conf.template > /etc/nginx/conf.d/default.conf
echo "[taskfactory-nginx] proxy /api -> http://${UPSTREAM}"
