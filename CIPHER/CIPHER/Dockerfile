# ==============================================================================
# CIPHER SYSTEM DOCKERFILE
# Multi-stage production container build for Next.js full-stack platform
# ==============================================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# Stage 1: Install Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build Application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime assets and built chunks
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/ai/status || exit 1

CMD ["npm", "run", "start"]
