use axum::{
    extract::{Path, State},
    http::Extensions,
    Json,
};

use crate::{
    error::{AppError, AppResult},
    middleware::auth::AuthUser,
    models::{
        lesson::{Exercise, Lesson, LessonWithExercises},
        progress::SpacedRepetition,
    },
    AppState,
};

/// GET /api/lessons — list all lessons (published only for students)
pub async fn list_lessons(State(state): State<AppState>) -> AppResult<Json<Vec<Lesson>>> {
    let lessons = sqlx::query_as::<_, Lesson>(
        "SELECT * FROM lessons WHERE is_published = TRUE ORDER BY sort_order ASC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(lessons))
}

/// GET /api/lessons/{id} — get a single lesson with its exercises
pub async fn get_lesson(
    State(state): State<AppState>,
    Path(lesson_id): Path<i32>,
) -> AppResult<Json<LessonWithExercises>> {
    let lesson = sqlx::query_as::<_, Lesson>("SELECT * FROM lessons WHERE id = $1")
        .bind(lesson_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Lesson {} not found", lesson_id)))?;

    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY section ASC, sort_order ASC",
    )
    .bind(lesson_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(LessonWithExercises { lesson, exercises }))
}

/// GET /api/lessons/{id}/exercises — get exercises for a lesson
pub async fn get_lesson_exercises(
    State(state): State<AppState>,
    Path(lesson_id): Path<i32>,
) -> AppResult<Json<Vec<Exercise>>> {
    // Use EXISTS for more efficient existence check
    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM lessons WHERE id = $1)",
    )
    .bind(lesson_id)
    .fetch_one(&state.db)
    .await?;

    if !exists {
        return Err(AppError::NotFound(format!("Lesson {} not found", lesson_id)));
    }

    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY section ASC, sort_order ASC",
    )
    .bind(lesson_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(exercises))
}

/// GET /api/review/due — get exercises due for spaced repetition review
pub async fn get_due_reviews(
    State(state): State<AppState>,
    extensions: Extensions,
) -> AppResult<Json<Vec<SpacedRepetition>>> {
    let auth_user = extensions
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let due = sqlx::query_as::<_, SpacedRepetition>(
        r#"
        SELECT * FROM spaced_repetition
        WHERE user_id = $1 AND next_review_at <= CURRENT_DATE
        ORDER BY next_review_at ASC
        LIMIT 20
        "#,
    )
    .bind(auth_user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(due))
}
