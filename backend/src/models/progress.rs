use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserProgress {
    pub id: i32,
    pub user_id: Uuid,
    pub lesson_id: i32,
    pub completed: bool,
    pub score: i32,
    pub max_score: i32,
    pub attempts: i32,
    pub last_attempt: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserStats {
    pub user_id: Uuid,
    pub xp_total: i32,
    pub streak_days: i32,
    pub longest_streak: i32,
    pub last_active: Option<NaiveDate>,
    pub badges: serde_json::Value,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProgressRequest {
    #[validate(range(min = 0, message = "Score must be non-negative"))]
    pub score: i32,
    #[validate(range(min = 0, message = "Max score must be non-negative"))]
    pub max_score: i32,
    pub completed: bool,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ExerciseAttemptRequest {
    pub correct: bool,
    #[validate(length(max = 1000, message = "Answer too long"))]
    pub answer_given: Option<String>,
    #[validate(range(min = 0, max = 600000, message = "Invalid time spent"))]
    pub time_spent_ms: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct ExerciseAttemptResponse {
    pub correct: bool,
    pub xp_earned: i32,
    pub correct_answer: String,
    pub hint: Option<String>,
}

/// Spaced repetition entry for SM-2 algorithm
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SpacedRepetition {
    pub id: i32,
    pub user_id: Uuid,
    pub exercise_id: i32,
    pub ease_factor: f32,
    pub interval_days: i32,
    pub repetitions: i32,
    pub next_review_at: NaiveDate,
    pub last_reviewed: DateTime<Utc>,
}

/// Leaderboard entry (from materialized view)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LeaderboardEntry {
    pub user_id: Uuid,
    pub display_name: String,
    pub xp_total: i32,
    pub streak_days: i32,
    pub longest_streak: i32,
    pub lessons_completed: i64,
    pub rank: i64,
}
