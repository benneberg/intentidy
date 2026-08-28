# Multi-stage production build for intenTidy
# Stage 1: Build & bundle frontend and backend
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Install package dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and configuration
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY server.ts ./
COPY data ./data

# Build production artifacts (Vite SPA + esbuild server bundle)
RUN npm run build

# Prune devDependencies for minimal runtime image
RUN npm prune --production

# Stage 2: Minimal hardened production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Create dedicated non-root application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 intentidy

# Copy production artifacts from builder
COPY --from=builder --chown=intentidy:nodejs /app/package.json ./package.json
COPY --from=builder --chown=intentidy:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=intentidy:nodejs /app/dist ./dist
COPY --from=builder --chown=intentidy:nodejs /app/data ./data

# Configure persistent data directory permissions
RUN mkdir -p /app/data/workspaces && \
    chown -R intentidy:nodejs /app/data

# Run container as unprivileged user
USER intentidy

# Expose application port
EXPOSE 3000

# Container liveness & readiness health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch compiled CommonJS server bundle
CMD ["node", "dist/server.cjs"]
