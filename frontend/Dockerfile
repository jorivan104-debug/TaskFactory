FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache curl
# Por defecto `app:3000` (nombre habitual del servicio API en Dokploy). En docker-compose local se fuerza `backend:3000`.
# Opcional: API_PUBLIC_URL = URL HTTPS pública del prefijo /api si no usa proxy interno.
ENV BACKEND_UPSTREAM=app:3000
RUN mkdir -p /etc/nginx/taskfactory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/taskfactory/default.conf.template
COPY docker-entrypoint.d/99-taskfactory-api-upstream.sh /docker-entrypoint.d/99-taskfactory-api-upstream.sh
RUN chmod +x /docker-entrypoint.d/99-taskfactory-api-upstream.sh
EXPOSE 80
