use axum::{extract::State, http::Extensions, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::{AuthUser, Claims},
    models::user::{AuthResponse, LoginRequest, RegisterRequest, User, UserPublic},
    AppState,
};

/// POST /api/auth/register
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Validate input
    if payload.email.trim().is_empty() || payload.password.len() < 8 {
        return Err(AppError::BadRequest(
            "Email is required and password must be at least 8 characters".to_string(),
        ));
    }

    // Check if email already exists
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE email = $1"
    )
    .bind(&payload.email.to_lowercase())
    .fetch_one(&state.db)
    .await?;

    if existing > 0 {
        return Err(AppError::Conflict("Email already registered".to_string()));
    }

    // Hash password
    let password_hash = hash(&payload.password, DEFAULT_COST)?;

    // Insert user
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(&payload.email.to_lowercase())
    .bind(&password_hash)
    .bind(&payload.display_name)
    .fetch_one(&state.db)
    .await?;

    // Create user_stats row
    sqlx::query("INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(user.id)
        .execute(&state.db)
        .await?;

    // Generate JWT
    let token = generate_token(&user, &state.config.jwt_secret, state.config.jwt_expiry_hours)?;

    Ok(Json(AuthResponse {
        token,
        user: UserPublic::from(user),
    }))
}

/// POST /api/auth/login
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&payload.email.to_lowercase())
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let valid = verify(&payload.password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    // Update last_active in user_stats
    let today = Utc::now().date_naive();
    sqlx::query(
        r#"
        INSERT INTO user_stats (user_id, last_active)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET last_active = EXCLUDED.last_active,
            streak_days = CASE
                WHEN user_stats.last_active = $2 - INTERVAL '1 day' THEN user_stats.streak_days + 1
                WHEN user_stats.last_active = $2 THEN user_stats.streak_days
                ELSE 1
            END,
            longest_streak = GREATEST(
                user_stats.longest_streak,
                CASE
                    WHEN user_stats.last_active = $2 - INTERVAL '1 day' THEN user_stats.streak_days + 1
                    ELSE user_stats.streak_days
                END
            ),
            updated_at = NOW()
        "#,
    )
    .bind(user.id)
    .bind(today)
    .execute(&state.db)
    .await?;

    let token = generate_token(&user, &state.config.jwt_secret, state.config.jwt_expiry_hours)?;

    Ok(Json(AuthResponse {
        token,
        user: UserPublic::from(user),
    }))
}

/// GET /api/auth/me  (requires auth middleware)
pub async fn me(
    State(state): State<AppState>,
    extensions: Extensions,
) -> AppResult<Json<UserPublic>> {
    let auth_user = extensions
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(UserPublic::from(user)))
}

/// PUT /api/auth/language  (requires auth) — toggle EN/FA preference
pub async fn update_language(
    State(state): State<AppState>,
    extensions: Extensions,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    let auth_user = extensions
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let lang = body
        .get("language_pref")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("language_pref field required".to_string()))?;

    if lang != "en" && lang != "fa" {
        return Err(AppError::BadRequest("language_pref must be 'en' or 'fa'".to_string()));
    }

    sqlx::query("UPDATE users SET language_pref = $1, updated_at = NOW() WHERE id = $2")
        .bind(lang)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    Ok(Json(serde_json::json!({ "language_pref": lang })))
}

fn generate_token(user: &User, secret: &str, expiry_hours: i64) -> AppResult<String> {
    let now = Utc::now();
    let exp = (now + chrono::Duration::hours(expiry_hours)).timestamp();

    let claims = Claims {
        sub: user.id,
        email: user.email.clone(),
        role: user.role.clone(),
        exp,
        iat: now.timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;

    Ok(token)
}
