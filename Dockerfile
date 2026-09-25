# =========================================================================
# 🌿 Farm2Future Platform - Production Dockerfile (Multi-Stage Build)
# =========================================================================

# Stage 1: Build the Vite production bundle
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy application source code
COPY . .

# Build the frontend assets with TypeScript and Vite
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests and install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy backend server scripts, database connectors, and initial data
COPY serve_dist.cjs ./
COPY server/ ./server/
COPY data/ ./data/

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 3000

# Health check to ensure the server is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/db/status').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the Farm2Future platform
CMD ["node", "serve_dist.cjs", "3000"]
