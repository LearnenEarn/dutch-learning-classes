# ═══════════════════════════════════════════════════════════════
# Dutch App Backend — Multi-stage Rust Build
# ═══════════════════════════════════════════════════════════════

# Stage 1: Build
FROM rust:1.83-slim-bookworm AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true

# Copy actual source
COPY src/ src/
COPY migrations/ migrations/

# Build for release
RUN cargo build --release

# Stage 2: Runtime (minimal image)
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/dutch-app-backend /app/dutch-app-backend
COPY --from=builder /app/migrations /app/migrations

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV RUST_LOG=dutch_app_backend=info,tower_http=info

CMD ["./dutch-app-backend"]
