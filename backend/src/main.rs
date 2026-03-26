mod config;
mod error;
mod middleware;
mod models;
mod routes;

use axum::{
    middleware as axum_middleware,
    routing::{get, post, put},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::{
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
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

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "dutch_app_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load config from environment
    let config = Config::from_env().expect("Failed to load configuration from environment");

    tracing::info!("Connecting to database...");

    // Connect to PostgreSQL
    let db = PgPoolOptions::new()
        .max_connections(20)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    tracing::info!("Running database migrations...");

    // Run SQLx migrations
    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to run database migrations");

    tracing::info!("Migrations complete.");

    let state = AppState {
        db,
        config: config.clone(),
    };

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_origin
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router
    let app = Router::new()
        // ── Public routes ──────────────────────────────────────────
        .route("/api/health", get(health_check))
        .route("/api/auth/register", post(routes::auth::register))
        .route("/api/auth/login", post(routes::auth::login))
        // ── Protected routes (require JWT) ─────────────────────────
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
        // Lessons
        .route("/api/lessons", get(routes::lessons::list_lessons))
        .route("/api/lessons/:id", get(routes::lessons::get_lesson))
        .route(
            "/api/lessons/:id/exercises",
            get(routes::lessons::get_lesson_exercises),
        )
        // Progress (auth required)
        .route(
            "/api/progress",
            get(routes::progress::get_all_progress)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        .route(
            "/api/progress/:lesson_id",
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
            "/api/exercises/:id/attempt",
            post(routes::progress::submit_exercise_attempt)
                .route_layer(axum_middleware::from_fn_with_state(state.clone(), require_auth)),
        )
        // ── Middleware layers ───────────────────────────────────────
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(cors)
        .with_state(state);

    // Bind and serve
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("Invalid host:port");

    tracing::info!("🚀 Dutch App backend listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "dutch-app-backend",
        "version": env!("CARGO_PKG_VERSION")
    }))
}
