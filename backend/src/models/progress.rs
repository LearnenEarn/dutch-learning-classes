use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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

#[derive(Debug, Deserialize)]
pub struct UpdateProgressRequest {
    pub score: i32,
    pub max_score: i32,
    pub completed: bool,
}

#[derive(Debug, Deserialize)]
pub struct ExerciseAttemptRequest {
    pub correct: bool,
    pub answer_given: Option<String>,
    pub time_spent_ms: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct ExerciseAttemptResponse {
    pub correct: bool,
    pub xp_earned: i32,
    pub correct_answer: String,
    pub hint: Option<String>,
}
