mod config;
mod error;
mod middleware;
mod models;
mod routes;

use axum::{
    http::{HeaderValue, Method},
    middleware as axum_middleware,
    routing::{get, post, put},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::{net::SocketAddr, time::Duration};
use tower_governor::{GovernorConfigBuilder, GovernorLayer};
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    set_header::SetResponseHeaderLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use config::Config;
use middleware::auth::require_auth;

/// Shared application state passed into all route handlers
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub config: Config,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env file
    dotenvy::dotenv().ok();

    // Initialize tracing with JSON format in production
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "dutch_app_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load config from environment
    let config = Config::from_env().expect("Failed to load configuration from environment");

    tracing::info!(
        environment = ?config.environment,
        "Starting Dutch App backend v{}",
        env!("CARGO_PKG_VERSION")
    );

    // ── Database connection pool with optimized settings ────────────
    tracing::info!("Connecting to database...");

    let db = PgPoolOptions::new()
        .max_connections(config.db_max_connections)
        .min_connections(config.db_min_connections)
        .idle_timeout(Duration::from_secs(config.db_idle_timeout_secs))
        .max_lifetime(Duration::from_secs(config.db_max_lifetime_secs))
        .acquire_timeout(Duration::from_secs(5))
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    tracing::info!(
        max_conn = config.db_max_connections,
        min_conn = config.db_min_connections,
        "Database pool established"
    );

    // ── Run migrations ─────────────────────────────────────────────
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to run database migrations");
    tracing::info!("Migrations complete.");

    let state = AppState {
        db,
        config: config.clone(),
    };

    // ── Rate limiting (governor) ─────────────────────────────────────
    // Strict rate limit for auth endpoints: uses config values directly
    let auth_rate_limit = GovernorConfigBuilder::default()
        .per_second(config.rate_limit_per_second)
        .burst_size(config.rate_limit_burst)
        .finish()
        .expect("Failed to build auth rate limiter");

    // Global rate limit: more lenient (10x the per-second rate, 5x burst)
    let global_rate_limit = GovernorConfigBuilder::default()
        .per_second(config.rate_limit_per_second.saturating_mul(10))
        .burst_size(config.rate_limit_burst.saturating_mul(5))
        .finish()
        .expect("Failed to build global rate limiter");

    tracing::info!(
        auth_rps = config.rate_limit_per_second,
        auth_burst = config.rate_limit_burst,
        "Rate limiters configured"
    );

    // ── CORS configuration ─────────────────────────────────────────
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_origin
                .parse::<HeaderValue>()
                .unwrap(),
        )
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ACCEPT,
        ])
        .allow_credentials(true)
        .max_age(Duration::from_secs(3600));

    // ── Build the router ───────────────────────────────────────────
    // Auth sub-router with strict per-IP rate limiting
    let auth_routes = Router::new()
        .route("/api/auth/register", post(routes::auth::register))
        .route("/api/auth/login", post(routes::auth::login))
        .layer(GovernorLayer {
            config: auth_rate_limit,
        });

    let app = Router::new()
        // ── Public routes ──────────────────────────────────────
        .route("/api/health", get(health_check))
        .route("/api/health/ready", get(readiness_check))
        // Rate-limited auth routes
        .merge(auth_routes)
        // ── Protected routes (require JWT) ─────────────────────
        .route(
            "/api/auth/me",
            get(routes::auth::me)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/auth/language",
            put(routes::auth::update_language)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/auth/change-password",
            put(routes::auth::change_password)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        // Lessons
        .route("/api/lessons", get(routes::lessons::list_lessons))
        .route("/api/lessons/{id}", get(routes::lessons::get_lesson))
        .route(
            "/api/lessons/{id}/exercises",
            get(routes::lessons::get_lesson_exercises),
        )
        // Spaced repetition
        .route(
            "/api/review/due",
            get(routes::lessons::get_due_reviews)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        // Progress (auth required)
        .route(
            "/api/progress",
            get(routes::progress::get_all_progress)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/progress/{lesson_id}",
            get(routes::progress::get_lesson_progress)
                .post(routes::progress::update_lesson_progress)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/stats",
            get(routes::progress::get_stats)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/leaderboard",
            get(routes::progress::get_leaderboard),
        )
        .route(
            "/api/exercises/{id}/attempt",
            post(routes::progress::submit_exercise_attempt)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        // ── Security headers ──────────────────────────────────
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::header::X_FRAME_OPTIONS,
            HeaderValue::from_static("DENY"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::HeaderName::from_static("x-xss-protection"),
            HeaderValue::from_static("1; mode=block"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::HeaderName::from_static("referrer-policy"),
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::HeaderName::from_static("permissions-policy"),
            HeaderValue::from_static("camera=(), microphone=(), geolocation=()"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            axum::http::header::STRICT_TRANSPORT_SECURITY,
            HeaderValue::from_static("max-age=63072000; includeSubDomains; preload"),
        ))
        // ── Middleware layers ──────────────────────────────────
        .layer(GovernorLayer {
            config: global_rate_limit,
        })
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(cors)
        .with_state(state);

    // ── Bind and serve with graceful shutdown ───────────────────────
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("Invalid host:port");

    tracing::info!("🚀 Dutch App backend listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;

    tracing::info!("Server shut down gracefully");
    Ok(())
}

/// Health check — returns immediately (liveness probe)
async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "dutch-app-backend",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Readiness check — verifies database connectivity
async fn readiness_check(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> axum::Json<serde_json::Value> {
    let db_ok = sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.db)
        .await
        .is_ok();

    let pool_info = state.db.size();

    axum::Json(serde_json::json!({
        "status": if db_ok { "ready" } else { "degraded" },
        "database": db_ok,
        "pool_size": pool_info,
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Graceful shutdown signal (Ctrl-C or SIGTERM)
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => { tracing::info!("Received Ctrl-C, shutting down..."); }
        _ = terminate => { tracing::info!("Received SIGTERM, shutting down..."); }
    }
}
