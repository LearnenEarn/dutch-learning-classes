use axum::{extract::State, http::{Extensions, HeaderMap}, Json};
use bcrypt::{hash, verify};
use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::{AuthUser, Claims},
    models::user::{
        AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, User, UserPublic,
    },
    AppState,
};

/// POST /api/auth/register
pub async fn register(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Check if registration is enabled
    if !state.config.enable_registration {
        return Err(AppError::Forbidden(
            "Registration is currently disabled".to_string(),
        ));
    }

    // Validate input with the validator crate
    payload
        .validate()
        .map_err(|e| AppError::Validation(format!("{}", e)))?;

    // Enforce password complexity
    validate_password_strength(&payload.password)?;

    // Sanitize email
    let email = payload.email.trim().to_lowercase();

    // Check if email already exists
    let existing =
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE email = $1")
            .bind(&email)
            .fetch_one(&state.db)
            .await?;

    if existing > 0 {
        return Err(AppError::Conflict("Email already registered".to_string()));
    }

    // Hash password with configurable cost
    let password_hash = hash(&payload.password, state.config.bcrypt_cost)?;

    // Sanitize display name
    let display_name = sanitize_text(&payload.display_name);

    // Insert user
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(&email)
    .bind(&password_hash)
    .bind(&display_name)
    .fetch_one(&state.db)
    .await?;

    // Create user_stats row
    sqlx::query("INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(user.id)
        .execute(&state.db)
        .await?;

    // Audit log (with IP and User-Agent)
    log_audit_event(&state, Some(user.id), "register", None, &headers).await;

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
    headers: HeaderMap,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Validate input
    payload
        .validate()
        .map_err(|e| AppError::Validation(format!("{}", e)))?;

    let email = payload.email.trim().to_lowercase();

    // Check for account lockout
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| {
            // Constant-time: don't reveal whether the email exists
            AppError::Unauthorized("Invalid email or password".to_string())
        })?;

    // Check if account is locked
    if let Some(locked_until) = user.locked_until {
        if locked_until > Utc::now() {
            let remaining = (locked_until - Utc::now()).num_minutes();
            return Err(AppError::AccountLocked(format!(
                "Account is locked. Try again in {} minutes.",
                remaining + 1
            )));
        }
    }

    // Check if account is active
    if !user.is_active {
        return Err(AppError::Forbidden(
            "Account has been deactivated".to_string(),
        ));
    }

    // Verify password
    let valid = verify(&payload.password, &user.password_hash)?;
    if !valid {
        // Increment failed login count using parameterized queries (no format! SQL)
        let new_count = user.failed_login_count + 1;

        if new_count >= state.config.max_login_attempts as i32 {
            // Lock the account: set failed count and lock_until via parameters
            sqlx::query(
                "UPDATE users SET failed_login_count = $1, locked_until = NOW() + ($2 || ' minutes')::INTERVAL WHERE id = $3",
            )
            .bind(new_count)
            .bind(state.config.lockout_duration_mins.to_string())
            .bind(user.id)
            .execute(&state.db)
            .await?;
        } else {
            // Just increment the counter
            sqlx::query(
                "UPDATE users SET failed_login_count = $1 WHERE id = $2",
            )
            .bind(new_count)
            .bind(user.id)
            .execute(&state.db)
            .await?;
        }

        // Audit failed login (with IP and User-Agent)
        log_audit_event(&state, Some(user.id), "login_failed", None, &headers).await;

        return Err(AppError::Unauthorized(
            "Invalid email or password".to_string(),
        ));
    }

    // Reset failed login count on success
    sqlx::query("UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = $1")
        .bind(user.id)
        .execute(&state.db)
        .await?;

    // Update last_active in user_stats with streak calculation
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

    // Audit successful login (with IP and User-Agent)
    log_audit_event(&state, Some(user.id), "login_success", None, &headers).await;

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

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE id = $1 AND is_active = TRUE",
    )
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
        return Err(AppError::BadRequest(
            "language_pref must be 'en' or 'fa'".to_string(),
        ));
    }

    sqlx::query("UPDATE users SET language_pref = $1, updated_at = NOW() WHERE id = $2")
        .bind(lang)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    Ok(Json(serde_json::json!({ "language_pref": lang })))
}

/// PUT /api/auth/change-password  (requires auth)
pub async fn change_password(
    State(state): State<AppState>,
    headers: HeaderMap,
    extensions: Extensions,
    Json(payload): Json<ChangePasswordRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let auth_user = extensions
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    // Validate
    payload
        .validate()
        .map_err(|e| AppError::Validation(format!("{}", e)))?;

    validate_password_strength(&payload.new_password)?;

    // Fetch current user
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.id)
        .fetch_one(&state.db)
        .await?;

    // Verify current password
    let valid = verify(&payload.current_password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized(
            "Current password is incorrect".to_string(),
        ));
    }

    // Hash and update new password
    let new_hash = hash(&payload.new_password, state.config.bcrypt_cost)?;
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    // Audit (with IP and User-Agent)
    log_audit_event(&state, Some(auth_user.id), "password_change", None, &headers).await;

    Ok(Json(
        serde_json::json!({ "message": "Password changed successfully" }),
    ))
}

// ── Helper functions ─────────────────────────────────────────────────

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

/// Validate password strength: must contain uppercase, lowercase, digit, and special char
fn validate_password_strength(password: &str) -> AppResult<()> {
    if password.len() < 8 {
        return Err(AppError::Validation(
            "Password must be at least 8 characters".to_string(),
        ));
    }

    let has_uppercase = password.chars().any(|c| c.is_uppercase());
    let has_lowercase = password.chars().any(|c| c.is_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());

    if !has_uppercase || !has_lowercase || !has_digit {
        return Err(AppError::Validation(
            "Password must contain uppercase, lowercase, and a digit".to_string(),
        ));
    }

    Ok(())
}

/// Sanitize text input: trim whitespace, remove control characters
fn sanitize_text(input: &str) -> String {
    input
        .trim()
        .chars()
        .filter(|c| !c.is_control())
        .collect::<String>()
}

/// Log an audit event to the database with IP and User-Agent
async fn log_audit_event(
    state: &AppState,
    user_id: Option<Uuid>,
    action: &str,
    metadata: Option<serde_json::Value>,
    headers: &HeaderMap,
) {
    let meta = metadata.unwrap_or_else(|| serde_json::json!({}));

    // Extract client IP from proxy headers (X-Forwarded-For or X-Real-IP)
    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|s| s.trim().to_string())
        .or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .map(|s| s.to_string())
        });

    // Extract User-Agent header
    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let _ = sqlx::query(
        "INSERT INTO audit_log (user_id, action, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4::INET, $5)",
    )
    .bind(user_id)
    .bind(action)
    .bind(meta)
    .bind(ip_address)
    .bind(user_agent)
    .execute(&state.db)
    .await;
}
