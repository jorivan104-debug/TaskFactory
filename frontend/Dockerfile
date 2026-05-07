FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Dokploy: nombre interno del servicio API + puerto (ej. taskfactory-app-lz4xlg:3000)
ENV BACKEND_UPSTREAM=backend:3000
RUN mkdir -p /etc/nginx/taskfactory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/taskfactory/default.conf.template
COPY docker-entrypoint.d/99-taskfactory-api-upstream.sh /docker-entrypoint.d/99-taskfactory-api-upstream.sh
RUN chmod +x /docker-entrypoint.d/99-taskfactory-api-upstream.sh
EXPOSE 80
