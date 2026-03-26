use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    error::{AppError, AppResult},
    models::lesson::{Exercise, Lesson, LessonWithExercises},
    AppState,
};

/// GET /api/lessons — list all lessons (published only for students)
pub async fn list_lessons(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Lesson>>> {
    let lessons = sqlx::query_as::<_, Lesson>(
        "SELECT * FROM lessons ORDER BY sort_order ASC"
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(lessons))
}

/// GET /api/lessons/:id — get a single lesson with its exercises
pub async fn get_lesson(
    State(state): State<AppState>,
    Path(lesson_id): Path<i32>,
) -> AppResult<Json<LessonWithExercises>> {
    let lesson = sqlx::query_as::<_, Lesson>(
        "SELECT * FROM lessons WHERE id = $1"
    )
    .bind(lesson_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Lesson {} not found", lesson_id)))?;

    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY sort_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(LessonWithExercises { lesson, exercises }))
}

/// GET /api/lessons/:id/exercises — get exercises for a lesson
pub async fn get_lesson_exercises(
    State(state): State<AppState>,
    Path(lesson_id): Path<i32>,
) -> AppResult<Json<Vec<Exercise>>> {
    // Verify lesson exists
    let exists = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM lessons WHERE id = $1"
    )
    .bind(lesson_id)
    .fetch_one(&state.db)
    .await?;

    if exists == 0 {
        return Err(AppError::NotFound(format!("Lesson {} not found", lesson_id)));
    }

    let exercises = sqlx::query_as::<_, Exercise>(
        "SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY sort_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(exercises))
}
