# -----------------------------------------------------------------------------
# Stage 1: Base
# We use a specific version hash for reproducibility, but '20-alpine' is fine for general use.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# -----------------------------------------------------------------------------
# Stage 2: Dependencies (Install ALL dependencies for building)
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies like TypeScript)
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Builder (Compile TypeScript to JavaScript)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project (This runs `tsc` and outputs to /dist)
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production Dependencies (Install ONLY production dependencies)
# -----------------------------------------------------------------------------
FROM base AS production-deps
WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies (skips typescript, eslint, etc.)
RUN npm ci --omit=dev

# -----------------------------------------------------------------------------
# Stage 5: Runner (Final Image)
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init to handle PID 1 signals (Ctrl+C, SIGTERM) correctly in Alpine
RUN apk add --no-cache dumb-init

# Don't run as root
USER node

# Copy production dependencies
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules

# Copy compiled code from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./

# Expose the port defined in your app
EXPOSE 3000

# Use dumb-init to start the server
CMD ["dumb-init", "node", "dist/server.js"]