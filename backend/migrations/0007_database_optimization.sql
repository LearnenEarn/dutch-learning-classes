-- Migration: 0007_database_optimization
-- Adds performance indexes, spaced repetition support, audit logging,
-- and prepares schema for horizontal scaling.

-- ══════════════════════════════════════════════════════════════════════
-- 1. COMPOSITE & COVERING INDEXES FOR HOT QUERY PATHS
-- ══════════════════════════════════════════════════════════════════════

-- Speed up lesson listing (sorted, filtered by publish state)
CREATE INDEX IF NOT EXISTS idx_lessons_published_sort
    ON lessons (is_published, sort_order);

-- Speed up exercise fetches: lesson + type + section (the three most filtered columns)
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_section
    ON exercises (lesson_id, section, sort_order);

-- Composite index for user+exercise pairs (frequently queried for "did I already do this?")
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_exercise
    ON exercise_attempts (user_id, exercise_id, attempted_at DESC);

-- Speed up progress dashboard queries (user + lesson + completed)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed
    ON user_progress (user_id, completed, lesson_id);

-- Partial index: only look at users who have active streaks (used in leaderboard/stats)
CREATE INDEX IF NOT EXISTS idx_user_stats_active_streak
    ON user_stats (streak_days DESC)
    WHERE streak_days > 0;

-- GIN index on JSONB columns for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_exercises_options_gin
    ON exercises USING GIN (options);

CREATE INDEX IF NOT EXISTS idx_user_stats_badges_gin
    ON user_stats USING GIN (badges);

-- ══════════════════════════════════════════════════════════════════════
-- 2. SPACED REPETITION SYSTEM (SM-2 ALGORITHM SUPPORT)
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spaced_repetition (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id     INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    ease_factor     REAL NOT NULL DEFAULT 2.5,       -- SM-2 ease factor (min 1.3)
    interval_days   INT NOT NULL DEFAULT 1,           -- days until next review
    repetitions     INT NOT NULL DEFAULT 0,           -- consecutive correct answers
    next_review_at  DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_spaced_rep_user_next
    ON spaced_repetition (user_id, next_review_at ASC);

CREATE INDEX IF NOT EXISTS idx_spaced_rep_due
    ON spaced_repetition (next_review_at)
    WHERE next_review_at <= CURRENT_DATE;

-- ══════════════════════════════════════════════════════════════════════
-- 3. DAILY CHALLENGE / WORD OF THE DAY
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS daily_challenges (
    id              SERIAL PRIMARY KEY,
    challenge_date  DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    exercise_id     INT REFERENCES exercises(id) ON DELETE SET NULL,
    word_nl         TEXT NOT NULL,
    word_en         TEXT NOT NULL,
    example_nl      TEXT,
    example_en      TEXT,
    difficulty      INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date
    ON daily_challenges (challenge_date DESC);

-- Track who completed daily challenges
CREATE TABLE IF NOT EXISTS daily_challenge_completions (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id    INT NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    xp_earned       INT NOT NULL DEFAULT 10,
    UNIQUE (user_id, challenge_id)
);

-- ══════════════════════════════════════════════════════════════════════
-- 4. AUDIT LOG FOR SECURITY & ANALYTICS
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,          -- e.g. 'login', 'register', 'exercise_attempt', 'password_change'
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time-based index for recent audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created
    ON audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_action
    ON audit_log (user_id, action, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════
-- 5. LOGIN ATTEMPT TRACKING (BRUTE FORCE PROTECTION)
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS login_attempts (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    ip_address      INET,
    success         BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
    ON login_attempts (email, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
    ON login_attempts (ip_address, attempted_at DESC);

-- ══════════════════════════════════════════════════════════════════════
-- 6. LEADERBOARD MATERIALIZED VIEW (FAST READS)
-- ══════════════════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT
    u.id AS user_id,
    u.display_name,
    COALESCE(s.xp_total, 0) AS xp_total,
    COALESCE(s.streak_days, 0) AS streak_days,
    COALESCE(s.longest_streak, 0) AS longest_streak,
    COUNT(DISTINCT up.lesson_id) FILTER (WHERE up.completed) AS lessons_completed,
    RANK() OVER (ORDER BY COALESCE(s.xp_total, 0) DESC) AS rank
FROM users u
LEFT JOIN user_stats s ON s.user_id = u.id
LEFT JOIN user_progress up ON up.user_id = u.id
GROUP BY u.id, u.display_name, s.xp_total, s.streak_days, s.longest_streak;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user
    ON leaderboard (user_id);

-- ══════════════════════════════════════════════════════════════════════
-- 7. ADD updated_at TRIGGERS FOR AUTOMATIC TIMESTAMP MAINTENANCE
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_stats table
DROP TRIGGER IF EXISTS trg_user_stats_updated_at ON user_stats;
CREATE TRIGGER trg_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════════════════
-- 8. ADD is_active / email_verified COLUMNS TO users TABLE
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Index for active users only
CREATE INDEX IF NOT EXISTS idx_users_active
    ON users (is_active)
    WHERE is_active = TRUE;

-- ══════════════════════════════════════════════════════════════════════
-- 9. TABLE PARTITIONING PREP (exercise_attempts by month)
-- Note: True partitioning requires recreating the table. For now, we add
-- a date column that enables future ATTACH PARTITION workflows.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS attempt_date DATE
    GENERATED ALWAYS AS (attempted_at::DATE) STORED;

CREATE INDEX IF NOT EXISTS idx_exercise_attempts_date
    ON exercise_attempts (attempt_date);

-- ══════════════════════════════════════════════════════════════════════
-- 10. DATABASE STATISTICS & VACUUM SETTINGS
-- ══════════════════════════════════════════════════════════════════════

-- Increase statistics target for frequently queried columns
ALTER TABLE exercise_attempts ALTER COLUMN user_id SET STATISTICS 1000;
ALTER TABLE exercise_attempts ALTER COLUMN exercise_id SET STATISTICS 1000;
ALTER TABLE user_progress ALTER COLUMN user_id SET STATISTICS 1000;

-- Analyze all tables to update query planner stats
ANALYZE users;
ANALYZE lessons;
ANALYZE exercises;
ANALYZE user_progress;
ANALYZE user_stats;
ANALYZE exercise_attempts;
