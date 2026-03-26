-- Migration: 0003_create_progress_stats
-- Creates user progress, stats, and exercise attempt tracking tables

CREATE TABLE IF NOT EXISTS user_progress (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    score           INT NOT NULL DEFAULT 0,
    max_score       INT NOT NULL DEFAULT 0,
    attempts        INT NOT NULL DEFAULT 0,
    last_attempt    TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp_total        INT NOT NULL DEFAULT 0,
    streak_days     INT NOT NULL DEFAULT 0,
    longest_streak  INT NOT NULL DEFAULT 0,
    last_active     DATE,
    badges          JSONB NOT NULL DEFAULT '[]',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id     INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    correct         BOOLEAN NOT NULL,
    answer_given    TEXT,
    time_spent_ms   INT,
    xp_earned       INT NOT NULL DEFAULT 0,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_attempts_user_id ON exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise_id ON exercise_attempts(exercise_id);
CREATE INDEX idx_exercise_attempts_attempted_at ON exercise_attempts(attempted_at);
