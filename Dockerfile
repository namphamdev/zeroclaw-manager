# Stage 1: Build zeroclaw
FROM rust:bookworm as zeroclaw-builder
WORKDIR /usr/src/zeroclaw
COPY zeroclaw/ .
RUN cargo build --release

# Stage 2: Build zeroclaw-manager
FROM node:20-bookworm-slim as manager-builder
WORKDIR /app
COPY zeroclaw-manager/package.json zeroclaw-manager/package-lock.json ./
RUN npm ci
COPY zeroclaw-manager/ .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runtime
FROM node:20-bookworm-slim

# Install runtime dependencies for zeroclaw
RUN apt-get update && apt-get install -y \
    ca-certificates \
    openssl \
    libsqlite3-0 \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy zeroclaw binary
COPY --from=zeroclaw-builder /usr/src/zeroclaw/target/release/zeroclaw /usr/local/bin/zeroclaw

# Copy nextjs standalone build
COPY --from=manager-builder /app/.next/standalone ./
COPY --from=manager-builder /app/.next/static ./.next/static
COPY --from=manager-builder /app/public ./public

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATA_DIR="/app/data"

EXPOSE 3000

CMD ["node", "server.js"]
