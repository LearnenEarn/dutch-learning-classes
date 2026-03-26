-- Seed: Lesson 1 exercises — De Basis & De Omgeving
-- Covers: sentence structure, pronouns, zijn/hebben, articles, question words,
-- connecting words, environment vocabulary (water, fishing, trade, architecture)

-- ── Section: Personal Pronouns (flashcards) ─────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'flashcard', 'pronouns', 'I', 'من', 'ik', 'I', NULL, 1, 5, NULL, 10),
(1, 'flashcard', 'pronouns', 'you (singular)', 'تو', 'jij / je', 'you', NULL, 1, 5, NULL, 11),
(1, 'flashcard', 'pronouns', 'he', 'او (مذکر)', 'hij', 'he', NULL, 1, 5, NULL, 12),
(1, 'flashcard', 'pronouns', 'she', 'او (مؤنث)', 'zij / ze', 'she', NULL, 1, 5, NULL, 13),
(1, 'flashcard', 'pronouns', 'it', 'آن', 'het', 'it', NULL, 1, 5, NULL, 14),
(1, 'flashcard', 'pronouns', 'we', 'ما', 'wij / we', 'we', NULL, 1, 5, NULL, 15),
(1, 'flashcard', 'pronouns', 'you (plural)', 'شما', 'jullie', 'you (plural)', NULL, 1, 5, NULL, 16),
(1, 'flashcard', 'pronouns', 'they', 'آنها', 'zij / ze', 'they', NULL, 1, 5, NULL, 17);

-- ── Section: Zijn (to be) — timed quiz ───────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'timed_quiz', 'zijn', 'I am', 'من هستم', 'Ik ben', 'I am',
  '{"choices": ["Ik ben", "Ik heb", "Ik is", "Ik zijn"], "correct_index": 0}', 1, 10, 'zijn = to be', 20),
(1, 'timed_quiz', 'zijn', 'you are', 'تو هستی', 'Jij bent', 'you are',
  '{"choices": ["Jij bent", "Jij heb", "Jij is", "Jij ben"], "correct_index": 0}', 1, 10, NULL, 21),
(1, 'timed_quiz', 'zijn', 'he / she is', 'او است', 'Hij / zij is', 'he/she is',
  '{"choices": ["Hij / zij is", "Hij / zij bent", "Hij / zij zijn", "Hij / zij ben"], "correct_index": 0}', 1, 10, NULL, 22),
(1, 'timed_quiz', 'zijn', 'we are', 'ما هستیم', 'Wij zijn', 'we are',
  '{"choices": ["Wij zijn", "Wij bent", "Wij ben", "Wij heb"], "correct_index": 0}', 1, 10, NULL, 23),
(1, 'timed_quiz', 'zijn', 'they are', 'آنها هستند', 'Zij zijn', 'they are',
  '{"choices": ["Zij zijn", "Zij bent", "Zij is", "Zij heb"], "correct_index": 0}', 1, 10, NULL, 24);

-- ── Section: Hebben (to have) — timed quiz ───────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'timed_quiz', 'hebben', 'I have', 'من دارم', 'Ik heb', 'I have',
  '{"choices": ["Ik heb", "Ik heeft", "Ik hebben", "Ik hebt"], "correct_index": 0}', 1, 10, 'hebben = to have', 30),
(1, 'timed_quiz', 'hebben', 'you have', 'تو داری', 'Jij hebt', 'you have',
  '{"choices": ["Jij hebt", "Jij heb", "Jij heeft", "Jij hebben"], "correct_index": 0}', 1, 10, NULL, 31),
(1, 'timed_quiz', 'hebben', 'he / she has', 'او دارد', 'Hij / zij heeft', 'he/she has',
  '{"choices": ["Hij / zij heeft", "Hij / zij heb", "Hij / zij hebt", "Hij / zij hebben"], "correct_index": 0}', 1, 10, NULL, 32);

-- ── Section: De/Het articles — timed quiz ───────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'timed_quiz', 'articles', 'the man', 'مرد', 'de man', 'the man',
  '{"choices": ["de man", "het man"], "correct_index": 0}', 1, 10, 'de = masculine/feminine', 40),
(1, 'timed_quiz', 'articles', 'the house', 'خانه', 'het huis', 'the house',
  '{"choices": ["het huis", "de huis"], "correct_index": 0}', 1, 10, 'het = neuter nouns', 41),
(1, 'timed_quiz', 'articles', 'the woman', 'زن', 'de vrouw', 'the woman',
  '{"choices": ["de vrouw", "het vrouw"], "correct_index": 0}', 1, 10, 'de = masculine/feminine', 42),
(1, 'timed_quiz', 'articles', 'the child', 'بچه', 'het kind', 'the child',
  '{"choices": ["het kind", "de kind"], "correct_index": 0}', 2, 10, 'kind = neuter; use het', 43),
(1, 'timed_quiz', 'articles', 'the bike', 'دوچرخه', 'de fiets', 'the bike',
  '{"choices": ["de fiets", "het fiets"], "correct_index": 0}', 1, 10, 'When in doubt: de (75% of nouns)', 44),
(1, 'timed_quiz', 'articles', 'the water', 'آب', 'het water', 'the water',
  '{"choices": ["het water", "de water"], "correct_index": 0}', 2, 10, 'water = neuter; het', 45);

-- ── Section: Question words — flashcards ────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(1, 'flashcard', 'question_words', 'who', 'کی', 'wie', 'who', NULL, 1, 5, 50),
(1, 'flashcard', 'question_words', 'what', 'چه', 'wat', 'what', NULL, 1, 5, 51),
(1, 'flashcard', 'question_words', 'where', 'کجا', 'waar', 'where', NULL, 1, 5, 52),
(1, 'flashcard', 'question_words', 'when', 'کی (چه وقت)', 'wanneer', 'when', NULL, 1, 5, 53),
(1, 'flashcard', 'question_words', 'why', 'چرا', 'waarom', 'why', NULL, 1, 5, 54),
(1, 'flashcard', 'question_words', 'how', 'چطور', 'hoe', 'how', NULL, 1, 5, 55),
(1, 'flashcard', 'question_words', 'how much / many', 'چقدر', 'hoeveel', 'how much / many', NULL, 1, 5, 56),
(1, 'flashcard', 'question_words', 'which', 'کدام', 'welke', 'which', NULL, 1, 5, 57);

-- ── Section: Environment vocabulary — matching ───────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'matching', 'environment_water',
  'Match the water/landscape words',
  'کلمات آب و منظره را جور کنید',
  'water', 'water',
  '{"pairs": [
    {"dutch": "water", "translation": "water", "translation_fa": "آب"},
    {"dutch": "zee", "translation": "sea", "translation_fa": "دریا"},
    {"dutch": "rivier", "translation": "river", "translation_fa": "رودخانه"},
    {"dutch": "kanaal", "translation": "canal", "translation_fa": "کانال"},
    {"dutch": "dijk", "translation": "dyke", "translation_fa": "سد"},
    {"dutch": "brug", "translation": "bridge", "translation_fa": "پل"},
    {"dutch": "haven", "translation": "harbour", "translation_fa": "بندر"},
    {"dutch": "strand", "translation": "beach", "translation_fa": "ساحل"}
  ]}',
  1, 20, NULL, 60),

(1, 'matching', 'environment_trade',
  'Match the trade vocabulary',
  'واژگان تجاری را جور کنید',
  'handel', 'trade',
  '{"pairs": [
    {"dutch": "handel", "translation": "trade", "translation_fa": "تجارت"},
    {"dutch": "markt", "translation": "market", "translation_fa": "بازار"},
    {"dutch": "winkel", "translation": "shop", "translation_fa": "مغازه"},
    {"dutch": "geld", "translation": "money", "translation_fa": "پول"},
    {"dutch": "koffie", "translation": "coffee", "translation_fa": "قهوه"},
    {"dutch": "thee", "translation": "tea", "translation_fa": "چای"},
    {"dutch": "goud", "translation": "gold", "translation_fa": "طلا"},
    {"dutch": "prijs", "translation": "price", "translation_fa": "قیمت"}
  ]}',
  1, 20, NULL, 61),

(1, 'matching', 'environment_architecture',
  'Match the architecture vocabulary',
  'واژگان معماری را جور کنید',
  'huis', 'house',
  '{"pairs": [
    {"dutch": "huis", "translation": "house", "translation_fa": "خانه"},
    {"dutch": "deur", "translation": "door", "translation_fa": "در"},
    {"dutch": "raam", "translation": "window", "translation_fa": "پنجره"},
    {"dutch": "trap", "translation": "stairs", "translation_fa": "پله"},
    {"dutch": "muur", "translation": "wall", "translation_fa": "دیوار"},
    {"dutch": "dak", "translation": "roof", "translation_fa": "بام"},
    {"dutch": "windmolen", "translation": "windmill", "translation_fa": "آسیاب بادی"},
    {"dutch": "toren", "translation": "tower", "translation_fa": "برج"}
  ]}',
  1, 20, NULL, 62);

-- ── Section: Sentence order (word arrangement) ──────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'sentence_order', 'grammar',
  'I drink water',
  'من آب می‌نوشم',
  'Ik drink water',
  'I drink water',
  '{"words": ["water", "Ik", "drink"], "correct_order": [1, 2, 0]}',
  1, 15, 'Subject + Verb + Object', 70),

(1, 'sentence_order', 'grammar',
  'Tomorrow I drink water',
  'فردا من آب می‌نوشم',
  'Morgen drink ik water',
  'Tomorrow I drink water',
  '{"words": ["water", "ik", "drink", "Morgen"], "correct_order": [3, 2, 1, 0]}',
  2, 20, 'Verb stays in position 2! Morgen → verb flips', 71),

(1, 'sentence_order', 'grammar',
  'She eats bread',
  'او نان می‌خورد',
  'Zij eet brood',
  'She eats bread',
  '{"words": ["brood", "Zij", "eet"], "correct_order": [1, 2, 0]}',
  1, 15, NULL, 72);

-- ── Section: Fill in the blank ───────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(1, 'fill_blank', 'grammar',
  'I ___ (to be) happy',
  'من خوشحال ___',
  'ben',
  'am',
  '{"sentence": "Ik ___ blij.", "answer": "ben", "hint_en": "zijn conjugation for ik"}',
  1, 10, 'zijn conjugation for ik = ben', 80),

(1, 'fill_blank', 'grammar',
  'She ___ (to have) a headache',
  'او سردرد ___',
  'heeft',
  'has',
  '{"sentence": "Zij ___ hoofdpijn.", "answer": "heeft", "hint_en": "hebben conjugation for zij = heeft"}',
  1, 10, 'hebben conjugation for zij = heeft', 81),

(1, 'fill_blank', 'grammar',
  '___ is that? (who)',
  '___ آن است؟',
  'Wie',
  'Who',
  '{"sentence": "___ is dat?", "answer": "Wie", "hint_en": "who = wie"}',
  1, 10, 'who = wie', 82),

(1, 'fill_blank', 'grammar',
  '___ is the market? (where)',
  '___ بازار است؟',
  'Waar',
  'Where',
  '{"sentence": "___ is de markt?", "answer": "Waar", "hint_en": "where = waar"}',
  1, 10, 'where = waar', 83);
