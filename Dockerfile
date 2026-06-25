# Multi-stage build for Voxmation
# Supports both development and production environments

# ============================================================================
# STAGE 1: Dependencies - Shared base for all subsequent stages
# ============================================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Install build essentials for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies with minimal cache
RUN npm ci --frozen-lockfile --production=false \
    && npm cache clean --force

# ============================================================================
# STAGE 2: Builder - Compile TypeScript and build frontend assets
# ============================================================================
FROM dependencies AS builder

WORKDIR /app

# Copy source code
COPY tsconfig.json tsconfig.json
COPY vite.config.ts vite.config.ts
COPY src ./src
COPY public ./public
COPY server ./server
COPY types ./types
COPY scripts ./scripts
COPY supabase ./supabase

# Build frontend (Vite)
RUN npm run build:client

# Build SSR and prerender
RUN npm run build

# ============================================================================
# STAGE 3: Backend Production - Express server only
# ============================================================================
FROM node:22-alpine AS backend-prod

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production dependencies only
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy backend source
COPY server ./server
COPY types ./types

# Create uploads directory with correct permissions
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["node", "--loader", "tsx", "server/index.ts"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# ============================================================================
# STAGE 4: Frontend Production - Static assets + Node SSR
# ============================================================================
FROM node:22-alpine AS frontend-prod

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN apk add --no-cache dumb-init

# Copy production dependencies only
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-ssr ./dist-ssr
COPY --from=builder /app/public ./public

# Copy entry server file
COPY src/entry-server.tsx ./src/
COPY vite.config.ts ./

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["npm", "run", "preview"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

# ============================================================================
# STAGE 5: Development - Full environment with all tools
# ============================================================================
FROM dependencies AS development

WORKDIR /app

# Install additional development tools
RUN apk add --no-cache \
    git \
    curl \
    wget \
    bash \
    vim

# Copy all source code
COPY . .

# Development doesn't run as non-root for easier debugging
EXPOSE 5000 3001

# Start both dev servers with hot reload
CMD ["npm", "run", "dev"]

# ============================================================================
# STAGE 6: Production - Optimized combined service
# ============================================================================
FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN apk add --no-cache dumb-init curl

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-ssr ./dist-ssr
COPY --from=builder /app/public ./public

# Copy server code
COPY server ./server
COPY types ./types
COPY src/entry-server.tsx ./src/
COPY vite.config.ts ./

# Create uploads directory
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000 3001

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Default to running backend; can override to run frontend
CMD ["node", "--loader", "tsx", "server/index.ts"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
