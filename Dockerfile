# syntax=docker/dockerfile:1
# Stage 1 always runs on the BUILD machine's native architecture (fast, no QEMU);
# it only produces static files, which are architecture-independent.
FROM --platform=$BUILDPLATFORM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: unprivileged nginx (runs as UID 101, listens on 8080). No RUN steps here,
# so the arm64 + amd64 variants need no emulation to build.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
USER 101
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
