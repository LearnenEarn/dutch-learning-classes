-- Migration: 0002_create_lessons_exercises
-- Creates lessons and exercises tables

CREATE TABLE IF NOT EXISTS lessons (
    id              SERIAL PRIMARY KEY,
    week            INT NOT NULL CHECK (week BETWEEN 1 AND 8),
    title_en        TEXT NOT NULL,
    title_nl        TEXT NOT NULL,
    description_en  TEXT,
    description_fa  TEXT,
    theme           TEXT,
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
    id              SERIAL PRIMARY KEY,
    lesson_id       INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN (
                        'flashcard',
                        'drag_drop',
                        'fill_blank',
                        'timed_quiz',
                        'matching',
                        'true_false',
                        'clock_game',
                        'sentence_order'
                    )),
    section         TEXT,           -- e.g. 'vocabulary', 'grammar', 'game'
    prompt_en       TEXT,
    prompt_fa       TEXT,
    answer_nl       TEXT NOT NULL,
    answer_en       TEXT,
    options         JSONB,          -- for multiple choice / drag-drop / matching options
    difficulty      INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    xp_reward       INT NOT NULL DEFAULT 5,
    hint_en         TEXT,
    hint_fa         TEXT,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_exercises_type ON exercises(type);

-- Seed the 8 lesson records (weeks 1-3 published, 4-8 as stubs)
INSERT INTO lessons (week, title_en, title_nl, description_en, description_fa, theme, is_published, sort_order) VALUES
(1, 'The Basics & The Environment', 'De Basis & De Omgeving',
 'History of Dutch, sentence structure, articles, question words, and environment vocabulary.',
 'تاریخ زبان هلندی، ساختار جملات، حروف تعریف، کلمات سؤالی و واژگان محیطی.',
 'basics, environment, water, trade, architecture', TRUE, 1),

(2, 'The Person', 'De Mens Centraal',
 'Body parts, health and illness vocabulary, emotions, character traits, and adjective usage.',
 'اعضای بدن، واژگان بهداشت و بیماری، احساسات، ویژگی‌های شخصیتی و استفاده از صفت.',
 'body, health, emotions, character', TRUE, 2),

(3, 'Time & Elements', 'Tijd & Elementen',
 'Days, months, seasons, telling time, nature, landscapes, animals, plants, and weather.',
 'روزها، ماه‌ها، فصل‌ها، گفتن ساعت، طبیعت، چشم‌اندازها، حیوانات، گیاهان و آب‌وهوا.',
 'time, calendar, nature, weather', TRUE, 3),

(4, 'Food & Shopping', 'Eten & Winkelen',
 'Food vocabulary, ordering in a restaurant, shopping phrases, and numbers.',
 'واژگان غذا، سفارش در رستوران، عبارات خرید و اعداد.',
 'food, shopping, numbers', FALSE, 4),

(5, 'Work & Study', 'Werk & School',
 'Workplace vocabulary, study-related terms, SRH Haarlem context, and daily routines.',
 'واژگان محیط کار، اصطلاحات مرتبط با تحصیل، زمینه SRH هارلم و روال‌های روزانه.',
 'work, study, routine', FALSE, 5),

(6, 'Travel & Transport', 'Reizen & Vervoer',
 'Public transport, directions, Dutch cities, and travel phrases.',
 'حمل‌ونقل عمومی، راهنمایی مسیر، شهرهای هلندی و عبارات سفر.',
 'travel, transport, directions', FALSE, 6),

(7, 'Social Life & Culture', 'Sociale Situaties',
 'Greetings, invitations, Dutch customs, celebrations, and social phrases.',
 'خوش‌آمدگویی، دعوتنامه‌ها، آداب هلندی، جشن‌ها و عبارات اجتماعی.',
 'social, culture, customs', FALSE, 7),

(8, 'Final Review & NT2 Practice', 'Eindtoets & NT2 Oefening',
 'Full review of all 7 weeks plus A1 NT2 practice test format exercises.',
 'مرور کامل هفت هفته به علاوه تمرینات قالب آزمون A1 NT2.',
 'review, nt2, test', FALSE, 8);
