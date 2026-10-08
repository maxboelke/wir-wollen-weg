# App image for the offline demo (deployment.md §0) – the same image becomes the
# production image after the go-live gate (OPS-3).

FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# --- dependencies (cached as long as the lockfile does not change) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- tools: full source + dev dependencies; runs migrations and seeds in the demo ---
FROM deps AS tools
COPY . .

# --- build ---
FROM tools AS build
# Static pages (landing) are rendered at build time; the demo build passes APP_ENV=demo
# so the "demo – no real data" banner is baked in there as well.
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV} NEXT_OUTPUT_STANDALONE=1
RUN pnpm build

# --- runtime: Next.js standalone server, non-root ---
FROM node:24-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
