-- Seed: Lesson 2 exercises — De Mens Centraal
-- Body parts, health, emotions, character traits, adjectives

-- ── Body parts: head — flashcards ────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, difficulty, xp_reward, sort_order) VALUES
(2, 'flashcard', 'body_head', 'head', 'سر', 'hoofd', 'head', 1, 5, 10),
(2, 'flashcard', 'body_head', 'hair', 'مو', 'haar', 'hair', 1, 5, 11),
(2, 'flashcard', 'body_head', 'face', 'صورت', 'gezicht', 'face', 1, 5, 12),
(2, 'flashcard', 'body_head', 'eye / eyes', 'چشم', 'oog / ogen', 'eye / eyes', 1, 5, 13),
(2, 'flashcard', 'body_head', 'ear / ears', 'گوش', 'oor / oren', 'ear / ears', 1, 5, 14),
(2, 'flashcard', 'body_head', 'nose', 'بینی', 'neus', 'nose', 1, 5, 15),
(2, 'flashcard', 'body_head', 'mouth', 'دهان', 'mond', 'mouth', 1, 5, 16),
(2, 'flashcard', 'body_head', 'tooth / teeth', 'دندان', 'tand / tanden', 'tooth / teeth', 1, 5, 17),
(2, 'flashcard', 'body_head', 'tongue', 'زبان', 'tong', 'tongue', 1, 5, 18),
(2, 'flashcard', 'body_head', 'chin', 'چانه', 'kin', 'chin', 2, 5, 19),
(2, 'flashcard', 'body_head', 'cheek', 'گونه', 'wang', 'cheek', 2, 5, 20);

-- ── Body parts: body — matching ──────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(2, 'matching', 'body_full',
  'Match body parts',
  'اعضای بدن را جور کنید',
  'lichaam', 'body',
  '{"pairs": [
    {"dutch": "nek", "translation": "neck", "translation_fa": "گردن"},
    {"dutch": "schouder", "translation": "shoulder", "translation_fa": "شانه"},
    {"dutch": "arm", "translation": "arm", "translation_fa": "بازو"},
    {"dutch": "hand", "translation": "hand", "translation_fa": "دست"},
    {"dutch": "been", "translation": "leg", "translation_fa": "پا"},
    {"dutch": "knie", "translation": "knee", "translation_fa": "زانو"},
    {"dutch": "voet", "translation": "foot", "translation_fa": "پا / کف پا"},
    {"dutch": "rug", "translation": "back", "translation_fa": "پشت"}
  ]}',
  1, 20, 30);

-- ── Health vocabulary — flashcards ───────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, difficulty, xp_reward, sort_order) VALUES
(2, 'flashcard', 'health', 'sick / ill', 'بیمار', 'ziek', 'sick', 1, 5, 40),
(2, 'flashcard', 'health', 'healthy', 'سالم', 'gezond', 'healthy', 1, 5, 41),
(2, 'flashcard', 'health', 'pain', 'درد', 'pijn', 'pain', 1, 5, 42),
(2, 'flashcard', 'health', 'headache', 'سردرد', 'hoofdpijn', 'headache', 1, 5, 43),
(2, 'flashcard', 'health', 'stomach ache', 'دل درد', 'buikpijn', 'stomach ache', 1, 5, 44),
(2, 'flashcard', 'health', 'fever', 'تب', 'koorts', 'fever', 1, 5, 45),
(2, 'flashcard', 'health', 'cough', 'سرفه', 'hoest', 'cough', 1, 5, 46),
(2, 'flashcard', 'health', 'tired', 'خسته', 'moe', 'tired', 1, 5, 47),
(2, 'flashcard', 'health', 'nauseous', 'حالت تهوع', 'misselijk', 'nauseous', 2, 5, 48),
(2, 'flashcard', 'health', 'dizzy', 'سرگیجه', 'duizelig', 'dizzy', 2, 5, 49);

-- ── Health phrases — fill in the blank ───────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(2, 'fill_blank', 'health_phrases',
  'I have a headache',
  'من سردرد دارم',
  'hoofdpijn',
  'headache',
  '{"sentence": "Ik heb ___.", "answer": "hoofdpijn", "hint_en": "head + pain"}',
  1, 10, 'hoofd (head) + pijn (pain)', 50),

(2, 'fill_blank', 'health_phrases',
  'I am sick',
  'من بیمار هستم',
  'ziek',
  'sick',
  '{"sentence": "Ik ben ___.", "answer": "ziek", "hint_en": "use zijn (to be) for states"}',
  1, 10, 'Use zijn (to be) for states: Ik ben...', 51),

(2, 'fill_blank', 'health_phrases',
  'She has a fever',
  'او تب دارد',
  'koorts',
  'fever',
  '{"sentence": "Zij heeft ___.", "answer": "koorts", "hint_en": "fever = koorts"}',
  1, 10, 'fever = koorts', 52),

(2, 'fill_blank', 'health_phrases',
  'I do not feel well',
  'حالم خوب نیست',
  'niet',
  'not',
  '{"sentence": "Ik voel me ___ goed.", "answer": "niet", "hint_en": "niet = not"}',
  1, 10, 'niet = not', 53);

-- ── Emotions — matching ───────────────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(2, 'matching', 'emotions',
  'Match the emotions',
  'احساسات را جور کنید',
  'emoties', 'emotions',
  '{"pairs": [
    {"dutch": "blij", "translation": "happy", "translation_fa": "خوشحال"},
    {"dutch": "verdrietig", "translation": "sad", "translation_fa": "غمگین"},
    {"dutch": "boos", "translation": "angry", "translation_fa": "عصبانی"},
    {"dutch": "bang", "translation": "scared", "translation_fa": "ترسیده"},
    {"dutch": "opgewonden", "translation": "excited", "translation_fa": "هیجان‌زده"},
    {"dutch": "trots", "translation": "proud", "translation_fa": "مغرور"},
    {"dutch": "verliefd", "translation": "in love", "translation_fa": "عاشق"},
    {"dutch": "rustig", "translation": "calm", "translation_fa": "آرام"}
  ]}',
  1, 20, 60),

-- ── Character traits — timed quiz ────────────────────────────────
(2, 'timed_quiz', 'character',
  'friendly / kind',
  'مهربان',
  'vriendelijk', 'friendly',
  '{"choices": ["vriendelijk", "grappig", "lui", "sterk"], "correct_index": 0}',
  1, 10, 70),

(2, 'timed_quiz', 'character',
  'funny',
  'خنده‌دار',
  'grappig', 'funny',
  '{"choices": ["grappig", "eerlijk", "slim", "lui"], "correct_index": 0}',
  1, 10, 71),

(2, 'timed_quiz', 'character',
  'smart / clever',
  'باهوش',
  'slim', 'smart',
  '{"choices": ["slim", "lui", "bang", "sterk"], "correct_index": 0}',
  1, 10, 72),

(2, 'timed_quiz', 'character',
  'lazy',
  'تنبل',
  'lui', 'lazy',
  '{"choices": ["lui", "ambitieus", "eerlijk", "slim"], "correct_index": 0}',
  1, 10, 73),

(2, 'timed_quiz', 'character',
  'ambitious',
  'جاه‌طلب',
  'ambitieus', 'ambitious',
  '{"choices": ["ambitieus", "lui", "naïef", "geduldig"], "correct_index": 0}',
  2, 10, 74);

-- ── Adjectives — fill in blank (descriptors) ─────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(2, 'fill_blank', 'adjectives',
  'She is tall (long)',
  'او بلند است',
  'lang',
  'tall/long',
  '{"sentence": "Zij is ___.", "answer": "lang", "hint_en": "tall/long = lang"}',
  1, 10, 'tall/long = lang', 80),

(2, 'fill_blank', 'adjectives',
  'He is short/small',
  'او کوتاه است',
  'klein',
  'small/short',
  '{"sentence": "Hij is ___.", "answer": "klein", "hint_en": "small/short = klein"}',
  1, 10, 'small/short = klein', 81),

(2, 'fill_blank', 'adjectives',
  'She has ___ hair (curly)',
  'موی فر دارد',
  'krullend',
  'curly',
  '{"sentence": "Zij heeft ___ haar.", "answer": "krullend", "hint_en": "curly = krullend"}',
  2, 10, 'curly = krullend', 82),

(2, 'fill_blank', 'adjectives',
  'He has ___ eyes (brown)',
  'چشمان قهوه‌ای دارد',
  'bruine',
  'brown',
  '{"sentence": "Hij heeft ___ ogen.", "answer": "bruine", "hint_en": "brown + e before de-word"}',
  2, 15, 'brown (bruin) + -e ending before noun: bruine', 83);
