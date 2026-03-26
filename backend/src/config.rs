use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    // Database
    pub database_url: String,
    pub db_max_connections: u32,
    pub db_min_connections: u32,
    pub db_idle_timeout_secs: u64,
    pub db_max_lifetime_secs: u64,

    // Auth
    pub jwt_secret: String,
    pub jwt_expiry_hours: i64,
    pub jwt_refresh_expiry_days: i64,

    // Server
    pub host: String,
    pub port: u16,
    pub frontend_origin: String,
    pub environment: Environment,

    // Security
    pub bcrypt_cost: u32,
    pub max_login_attempts: u32,
    pub lockout_duration_mins: u32,
    pub rate_limit_per_second: u64,
    pub rate_limit_burst: u32,

    // Feature flags
    pub enable_registration: bool,
    pub enable_demo_mode: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

impl Environment {
    pub fn is_production(&self) -> bool {
        matches!(self, Environment::Production)
    }
}

impl Config {
    pub fn from_env() -> Result<Self, env::VarError> {
        let environment = match env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "development".to_string())
            .to_lowercase()
            .as_str()
        {
            "production" | "prod" => Environment::Production,
            "staging" | "stg" => Environment::Staging,
            _ => Environment::Development,
        };

        Ok(Config {
            // Database
            database_url: env::var("DATABASE_URL")?,
            db_max_connections: parse_env("DB_MAX_CONNECTIONS", 20),
            db_min_connections: parse_env("DB_MIN_CONNECTIONS", 5),
            db_idle_timeout_secs: parse_env("DB_IDLE_TIMEOUT_SECS", 300),
            db_max_lifetime_secs: parse_env("DB_MAX_LIFETIME_SECS", 1800),

            // Auth
            jwt_secret: env::var("JWT_SECRET")?,
            jwt_expiry_hours: parse_env("JWT_EXPIRY_HOURS", 24),
            jwt_refresh_expiry_days: parse_env("JWT_REFRESH_EXPIRY_DAYS", 30),

            // Server
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: parse_env("PORT", 3000),
            frontend_origin: env::var("FRONTEND_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            environment,

            // Security
            bcrypt_cost: parse_env("BCRYPT_COST", 12),
            max_login_attempts: parse_env("MAX_LOGIN_ATTEMPTS", 5),
            lockout_duration_mins: parse_env("LOCKOUT_DURATION_MINS", 15),
            rate_limit_per_second: parse_env("RATE_LIMIT_PER_SECOND", 10),
            rate_limit_burst: parse_env("RATE_LIMIT_BURST", 30),

            // Feature flags
            enable_registration: parse_env("ENABLE_REGISTRATION", true),
            enable_demo_mode: parse_env("ENABLE_DEMO_MODE", false),
        })
    }
}

/// Parse an environment variable with a default fallback
fn parse_env<T: std::str::FromStr>(key: &str, default: T) -> T {
    env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}
