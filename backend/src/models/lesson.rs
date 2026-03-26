use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Lesson {
    pub id: i32,
    pub week: i32,
    pub title_en: String,
    pub title_nl: String,
    pub description_en: Option<String>,
    pub description_fa: Option<String>,
    pub theme: Option<String>,
    pub is_published: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Exercise {
    pub id: i32,
    pub lesson_id: i32,
    pub r#type: String,
    pub section: Option<String>,
    pub prompt_en: Option<String>,
    pub prompt_fa: Option<String>,
    pub answer_nl: String,
    pub answer_en: Option<String>,
    pub options: Option<serde_json::Value>,
    pub difficulty: i32,
    pub xp_reward: i32,
    pub hint_en: Option<String>,
    pub hint_fa: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonWithExercises {
    #[serde(flatten)]
    pub lesson: Lesson,
    pub exercises: Vec<Exercise>,
}
