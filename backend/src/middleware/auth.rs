use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use chrono::Utc;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, AppState};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,      // user id
    pub email: String,
    pub role: String,
    pub exp: i64,       // expiry timestamp
    pub iat: i64,       // issued at
}

/// Extension type injected into request by auth middleware
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

/// Middleware: validates JWT from Authorization: Bearer <token> header
/// Also verifies the user account is still active and not locked in the DB.
pub async fn require_auth(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&req)?;

    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".to_string()))?;

    // ── DB-backed revocation check ──────────────────────────────
    // Verify user is still active and not locked, even if the JWT is valid.
    let user_status = sqlx::query_as::<_, (bool, Option<chrono::DateTime<Utc>>)>(
        "SELECT is_active, locked_until FROM users WHERE id = $1",
    )
    .bind(token_data.claims.sub)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| AppError::Internal("Failed to verify user status".to_string()))?;

    match user_status {
        Some((is_active, locked_until)) => {
            if !is_active {
                return Err(AppError::Forbidden("Account has been deactivated".to_string()));
            }
            if let Some(locked) = locked_until {
                if locked > Utc::now() {
                    return Err(AppError::AccountLocked("Account is temporarily locked".to_string()));
                }
            }
        }
        None => {
            return Err(AppError::Unauthorized("User no longer exists".to_string()));
        }
    }

    let auth_user = AuthUser {
        id: token_data.claims.sub,
        email: token_data.claims.email.clone(),
        role: token_data.claims.role.clone(),
    };

    req.extensions_mut().insert(auth_user);
    Ok(next.run(req).await)
}

/// Middleware: only allows admin role (also validates user is active in DB)
pub async fn require_admin(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&req)?;

    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".to_string()))?;

    if token_data.claims.role != "admin" {
        return Err(AppError::Forbidden("Admin access required".to_string()));
    }

    // ── DB-backed revocation check (same as require_auth) ───────
    let user_status = sqlx::query_as::<_, (bool, Option<chrono::DateTime<Utc>>)>(
        "SELECT is_active, locked_until FROM users WHERE id = $1",
    )
    .bind(token_data.claims.sub)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| AppError::Internal("Failed to verify user status".to_string()))?;

    match user_status {
        Some((is_active, locked_until)) => {
            if !is_active {
                return Err(AppError::Forbidden("Account has been deactivated".to_string()));
            }
            if let Some(locked) = locked_until {
                if locked > Utc::now() {
                    return Err(AppError::AccountLocked("Account is temporarily locked".to_string()));
                }
            }
        }
        None => {
            return Err(AppError::Unauthorized("User no longer exists".to_string()));
        }
    }

    let auth_user = AuthUser {
        id: token_data.claims.sub,
        email: token_data.claims.email.clone(),
        role: token_data.claims.role.clone(),
    };

    req.extensions_mut().insert(auth_user);
    Ok(next.run(req).await)
}

fn extract_bearer_token(req: &Request) -> Result<String, AppError> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::Unauthorized(
            "Authorization header must start with Bearer".to_string(),
        ));
    }

    Ok(auth_header[7..].to_string())
}
