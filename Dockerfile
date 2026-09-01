# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- Dependencies ----
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-api,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ---- Production ----
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-api,target=/pnpm/store pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]