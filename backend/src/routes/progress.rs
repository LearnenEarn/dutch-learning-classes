use axum::{
    extract::{Path, State},
    http::Extensions,
    Json,
};
use chrono::Utc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::AuthUser,
    models::progress::{
        ExerciseAttemptRequest, ExerciseAttemptResponse, UpdateProgressRequest, UserProgress,
        UserStats,
    },
    AppState,
};

/// GET /api/progress  — get all lesson progress for current user
pub async fn get_all_progress(
    State(state): State<AppState>,
    extensions: Extensions,
) -> AppResult<Json<Vec<UserProgress>>> {
    let auth_user = get_auth_user(&extensions)?;

    let progress = sqlx::query_as::<_, UserProgress>(
        "SELECT * FROM user_progress WHERE user_id = $1 ORDER BY lesson_id ASC"
    )
    .bind(auth_user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(progress))
}

/// GET /api/progress/:lesson_id  — get progress for a specific lesson
pub async fn get_lesson_progress(
    State(state): State<AppState>,
    extensions: Extensions,
    Path(lesson_id): Path<i32>,
) -> AppResult<Json<UserProgress>> {
    let auth_user = get_auth_user(&extensions)?;

    let progress = sqlx::query_as::<_, UserProgress>(
        "SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2"
    )
    .bind(auth_user.id)
    .bind(lesson_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("No progress record for lesson {}", lesson_id)))?;

    Ok(Json(progress))
}

/// POST /api/progress/:lesson_id  — upsert progress for a lesson
pub async fn update_lesson_progress(
    State(state): State<AppState>,
    extensions: Extensions,
    Path(lesson_id): Path<i32>,
    Json(payload): Json<UpdateProgressRequest>,
) -> AppResult<Json<UserProgress>> {
    let auth_user = get_auth_user(&extensions)?;

    let xp_gain = if payload.completed { 50 } else { 10 };

    // Upsert progress
    let progress = sqlx::query_as::<_, UserProgress>(
        r#"
        INSERT INTO user_progress (user_id, lesson_id, completed, score, max_score, attempts, last_attempt, completed_at)
        VALUES ($1, $2, $3, $4, $5, 1, NOW(), CASE WHEN $3 THEN NOW() ELSE NULL END)
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed = EXCLUDED.completed OR user_progress.completed,
            score = GREATEST(EXCLUDED.score, user_progress.score),
            max_score = EXCLUDED.max_score,
            attempts = user_progress.attempts + 1,
            last_attempt = NOW(),
            completed_at = CASE
                WHEN EXCLUDED.completed AND user_progress.completed_at IS NULL THEN NOW()
                ELSE user_progress.completed_at
            END
        RETURNING *
        "#,
    )
    .bind(auth_user.id)
    .bind(lesson_id)
    .bind(payload.completed)
    .bind(payload.score)
    .bind(payload.max_score)
    .fetch_one(&state.db)
    .await?;

    // Award XP
    sqlx::query(
        r#"
        INSERT INTO user_stats (user_id, xp_total)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET
            xp_total = user_stats.xp_total + $2,
            updated_at = NOW()
        "#,
    )
    .bind(auth_user.id)
    .bind(xp_gain)
    .execute(&state.db)
    .await?;

    Ok(Json(progress))
}

/// GET /api/stats  — get user XP, streak, badges
pub async fn get_stats(
    State(state): State<AppState>,
    extensions: Extensions,
) -> AppResult<Json<UserStats>> {
    let auth_user = get_auth_user(&extensions)?;

    let stats = sqlx::query_as::<_, UserStats>(
        "SELECT * FROM user_stats WHERE user_id = $1"
    )
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Stats not found for user".to_string()))?;

    Ok(Json(stats))
}

/// POST /api/exercises/:id/attempt  — submit an exercise attempt
pub async fn submit_exercise_attempt(
    State(state): State<AppState>,
    extensions: Extensions,
    Path(exercise_id): Path<i32>,
    Json(payload): Json<ExerciseAttemptRequest>,
) -> AppResult<Json<ExerciseAttemptResponse>> {
    let auth_user = get_auth_user(&extensions)?;

    // Fetch exercise for XP reward and correct answer
    let exercise = sqlx::query!(
        "SELECT xp_reward, answer_nl, hint_en FROM exercises WHERE id = $1",
        exercise_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Exercise {} not found", exercise_id)))?;

    let xp_earned = if payload.correct { exercise.xp_reward } else { 0 };

    // Record attempt
    sqlx::query(
        r#"
        INSERT INTO exercise_attempts (user_id, exercise_id, correct, answer_given, time_spent_ms, xp_earned)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(auth_user.id)
    .bind(exercise_id)
    .bind(payload.correct)
    .bind(&payload.answer_given)
    .bind(payload.time_spent_ms)
    .bind(xp_earned)
    .execute(&state.db)
    .await?;

    // Award XP if correct
    if xp_earned > 0 {
        sqlx::query(
            r#"
            INSERT INTO user_stats (user_id, xp_total)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET
                xp_total = user_stats.xp_total + $2,
                updated_at = NOW()
            "#,
        )
        .bind(auth_user.id)
        .bind(xp_earned)
        .execute(&state.db)
        .await?;
    }

    Ok(Json(ExerciseAttemptResponse {
        correct: payload.correct,
        xp_earned,
        correct_answer: exercise.answer_nl,
        hint: exercise.hint_en,
    }))
}

fn get_auth_user(extensions: &Extensions) -> AppResult<&AuthUser> {
    extensions
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))
}
