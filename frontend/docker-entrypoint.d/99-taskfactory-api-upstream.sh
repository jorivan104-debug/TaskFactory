#!/bin/sh
set -e
# Debe ejecutarse después de 20-envsubst-on-templates (orden numérico en /docker-entrypoint.d/).
# Dokploy: nombre del servicio del backend en la misma red Docker, puerto interno del API.
export BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-backend:3000}"
envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/taskfactory/default.conf.template > /etc/nginx/conf.d/default.conf
echo "[taskfactory-nginx] proxy /api -> http://${BACKEND_UPSTREAM}"
