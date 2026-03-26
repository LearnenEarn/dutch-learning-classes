-- Seed: Lesson 3 exercises — Tijd & Elementen
-- Days, months, seasons, time expressions, nature, weather

-- ── Days of the week — flashcards ────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, difficulty, xp_reward, sort_order) VALUES
(3, 'flashcard', 'days', 'Monday', 'دوشنبه', 'maandag', 'Monday', 1, 5, 10),
(3, 'flashcard', 'days', 'Tuesday', 'سه‌شنبه', 'dinsdag', 'Tuesday', 1, 5, 11),
(3, 'flashcard', 'days', 'Wednesday', 'چهارشنبه', 'woensdag', 'Wednesday', 1, 5, 12),
(3, 'flashcard', 'days', 'Thursday', 'پنجشنبه', 'donderdag', 'Thursday', 1, 5, 13),
(3, 'flashcard', 'days', 'Friday', 'جمعه', 'vrijdag', 'Friday', 1, 5, 14),
(3, 'flashcard', 'days', 'Saturday', 'شنبه', 'zaterdag', 'Saturday', 1, 5, 15),
(3, 'flashcard', 'days', 'Sunday', 'یکشنبه', 'zondag', 'Sunday', 1, 5, 16);

-- ── Months — flashcards ───────────────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, difficulty, xp_reward, sort_order) VALUES
(3, 'flashcard', 'months', 'January', 'ژانویه', 'januari', 'January', 1, 5, 20),
(3, 'flashcard', 'months', 'February', 'فوریه', 'februari', 'February', 1, 5, 21),
(3, 'flashcard', 'months', 'March', 'مارس', 'maart', 'March', 1, 5, 22),
(3, 'flashcard', 'months', 'April', 'آوریل', 'april', 'April', 1, 5, 23),
(3, 'flashcard', 'months', 'May', 'مه', 'mei', 'May', 1, 5, 24),
(3, 'flashcard', 'months', 'June', 'ژوئن', 'juni', 'June', 1, 5, 25),
(3, 'flashcard', 'months', 'September', 'سپتامبر', 'september', 'September', 1, 5, 26),
(3, 'flashcard', 'months', 'December', 'دسامبر', 'december', 'December', 1, 5, 27);

-- ── Seasons — matching ────────────────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(3, 'matching', 'seasons',
  'Match the seasons',
  'فصل‌ها را جور کنید',
  'seizoenen', 'seasons',
  '{"pairs": [
    {"dutch": "lente", "translation": "spring", "translation_fa": "بهار"},
    {"dutch": "zomer", "translation": "summer", "translation_fa": "تابستان"},
    {"dutch": "herfst", "translation": "autumn", "translation_fa": "پاییز"},
    {"dutch": "winter", "translation": "winter", "translation_fa": "زمستان"}
  ]}',
  1, 15, 30);

-- ── Clock game ───────────────────────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(3, 'clock_game', 'time',
  'Half past two',
  'دو و نیم',
  'half drie',
  'half past two',
  '{"time_24h": "14:30", "expression": "half drie"}',
  2, 20, 'half drie = HALFWAY to three = 2:30!', 40),

(3, 'clock_game', 'time',
  'Quarter past two',
  'دو و ربع',
  'kwart over twee',
  'quarter past two',
  '{"time_24h": "14:15", "expression": "kwart over twee"}',
  1, 15, 'kwart over = quarter past', 41),

(3, 'clock_game', 'time',
  'Quarter to three',
  'سه کمه یه ربع',
  'kwart voor drie',
  'quarter to three',
  '{"time_24h": "14:45", "expression": "kwart voor drie"}',
  2, 20, 'kwart voor = quarter to', 42),

(3, 'clock_game', 'time',
  'Half past seven',
  'هفت و نیم',
  'half acht',
  'half past seven',
  '{"time_24h": "07:30", "expression": "half acht"}',
  2, 20, 'half acht = halfway to 8 = 7:30', 43),

(3, 'clock_game', 'time',
  'Quarter to six',
  'شش کمه یه ربع',
  'kwart voor zes',
  'quarter to six',
  '{"time_24h": "17:45", "expression": "kwart voor zes"}',
  2, 20, NULL, 44);

-- ── Nature category sort ──────────────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(3, 'drag_drop', 'nature_sort',
  'Sort words into: Day, Nature, Weather, Season',
  'کلمات را در دسته‌بندی کنید: روز، طبیعت، آب‌وهوا، فصل',
  'categorie', 'category',
  '{"mode": "category_sort",
    "categories": ["Dag", "Natuur", "Weer", "Seizoen"],
    "items": [
      {"id": "maandag", "text": "maandag", "category": "Dag"},
      {"id": "dinsdag", "text": "dinsdag", "category": "Dag"},
      {"id": "vrijdag", "text": "vrijdag", "category": "Dag"},
      {"id": "zondag", "text": "zondag", "category": "Dag"},
      {"id": "vogel", "text": "vogel", "category": "Natuur"},
      {"id": "boom", "text": "boom", "category": "Natuur"},
      {"id": "vlinder", "text": "vlinder", "category": "Natuur"},
      {"id": "koe", "text": "koe", "category": "Natuur"},
      {"id": "storm", "text": "storm", "category": "Weer"},
      {"id": "regen", "text": "regen", "category": "Weer"},
      {"id": "sneeuw", "text": "sneeuw", "category": "Weer"},
      {"id": "mist", "text": "mist", "category": "Weer"},
      {"id": "lente", "text": "lente", "category": "Seizoen"},
      {"id": "zomer", "text": "zomer", "category": "Seizoen"},
      {"id": "herfst", "text": "herfst", "category": "Seizoen"},
      {"id": "winter", "text": "winter", "category": "Seizoen"}
    ]}',
  1, 30, NULL, 50);

-- ── Nature vocabulary — matching ─────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(3, 'matching', 'nature',
  'Match nature words',
  'کلمات طبیعت را جور کنید',
  'natuur', 'nature',
  '{"pairs": [
    {"dutch": "boom", "translation": "tree", "translation_fa": "درخت"},
    {"dutch": "bloem", "translation": "flower", "translation_fa": "گل"},
    {"dutch": "bos", "translation": "forest", "translation_fa": "جنگل"},
    {"dutch": "gras", "translation": "grass", "translation_fa": "علف"},
    {"dutch": "vogel", "translation": "bird", "translation_fa": "پرنده"},
    {"dutch": "vlinder", "translation": "butterfly", "translation_fa": "پروانه"},
    {"dutch": "tulp", "translation": "tulip", "translation_fa": "لاله"},
    {"dutch": "regenboog", "translation": "rainbow", "translation_fa": "رنگین‌کمان"}
  ]}',
  1, 20, 60);

-- ── Weather vocabulary — matching ────────────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, sort_order) VALUES
(3, 'matching', 'weather',
  'Match weather words',
  'واژگان آب‌وهوا را جور کنید',
  'weer', 'weather',
  '{"pairs": [
    {"dutch": "regen", "translation": "rain", "translation_fa": "باران"},
    {"dutch": "sneeuw", "translation": "snow", "translation_fa": "برف"},
    {"dutch": "wind", "translation": "wind", "translation_fa": "باد"},
    {"dutch": "zon", "translation": "sun", "translation_fa": "آفتاب"},
    {"dutch": "wolk", "translation": "cloud", "translation_fa": "ابر"},
    {"dutch": "bliksem", "translation": "lightning", "translation_fa": "برق"},
    {"dutch": "donder", "translation": "thunder", "translation_fa": "رعد"},
    {"dutch": "mist", "translation": "fog", "translation_fa": "مه"}
  ]}',
  1, 20, 70);

-- ── True/False (Juist of Onjuist) — timed quiz ───────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(3, 'true_false', 'trivia',
  'Half drie means 3:30 in Dutch — True or False?',
  'half drie در هلندی ساعت ۳:۳۰ است — درست یا غلط؟',
  'onjuist',
  'False',
  '{"statement": "''Half drie'' in Dutch means 3:30.", "correct": false, "explanation": "Half drie = 2:30 (halfway TO three)"}',
  2, 15, 'half drie = HALFWAY to three = 2:30!', 80),

(3, 'true_false', 'trivia',
  'The tulip originally came from the Netherlands — True or False?',
  'لاله اصالتاً از هلند آمده است — درست یا غلط؟',
  'onjuist',
  'False',
  '{"statement": "The tulip originally came from the Netherlands.", "correct": false, "explanation": "The tulip came from Persia and the Ottoman Empire (lale = لاله)"}',
  2, 15, 'Tulip = lale in Persian — it came from Persia!', 81),

(3, 'true_false', 'trivia',
  'Maandag means Monday in Dutch — True or False?',
  'maandag یعنی دوشنبه در هلندی — درست یا غلط؟',
  'juist',
  'True',
  '{"statement": "Maandag means Monday in Dutch.", "correct": true, "explanation": "Maandag = Moon''s day"}',
  1, 10, 'maan = moon, dag = day', 82),

(3, 'true_false', 'trivia',
  'In Dutch, lente means spring — True or False?',
  'در هلندی، lente یعنی بهار — درست یا غلط؟',
  'juist',
  'True',
  '{"statement": "Lente means spring in Dutch.", "correct": true, "explanation": "lente = spring (from Germanic word meaning ''long'' — days growing longer)"}',
  1, 10, NULL, 83),

(3, 'true_false', 'trivia',
  'Regenboog means rainbow in Dutch — True or False?',
  'regenboog در هلندی یعنی رنگین‌کمان — درست یا غلط؟',
  'juist',
  'True',
  '{"statement": "Regenboog means rainbow in Dutch.", "correct": true, "explanation": "regen (rain) + boog (arc/bow) = regenboog"}',
  1, 10, 'regen = rain, boog = arc/bow', 84),

(3, 'true_false', 'trivia',
  '"Het is bewolkt" means it is sunny — True or False?',
  '"Het is bewolkt" یعنی آفتابی است — درست یا غلط؟',
  'onjuist',
  'False',
  '{"statement": "''Het is bewolkt'' means it is sunny.", "correct": false, "explanation": "bewolkt = cloudy. Sunny = het is zonnig"}',
  2, 15, 'bewolkt = cloudy (wolk = cloud)', 85);

-- ── Weather sentence fill in the blank ───────────────────────────
INSERT INTO exercises (lesson_id, type, section, prompt_en, prompt_fa, answer_nl, answer_en, options, difficulty, xp_reward, hint_en, sort_order) VALUES
(3, 'fill_blank', 'weather_sentences',
  'It is raining today (verb)',
  'امروز باران می‌بارد',
  'regent',
  'is raining',
  '{"sentence": "Vandaag ___ het.", "answer": "regent", "hint_en": "regen = rain, verb = regent"}',
  1, 10, 'regen (rain) → het regent (it is raining)', 90),

(3, 'fill_blank', 'weather_sentences',
  'In ___ the tulips bloom along the canal. (season)',
  'در ___ لاله‌ها در کنار کانال شکوفا می‌شوند',
  'lente',
  'spring',
  '{"sentence": "In de ___ bloeien de tulpen.", "answer": "lente", "hint_en": "tulips bloom in spring"}',
  1, 10, 'tulips bloom in spring = lente', 91),

(3, 'fill_blank', 'weather_sentences',
  'It is ___ today — take an umbrella! (windy verb)',
  'امروز ___ می‌وزد — چتر ببر!',
  'waait',
  'windy',
  '{"sentence": "Het ___ hard vandaag.", "answer": "waait", "hint_en": "wind → het waait (it is windy)"}',
  2, 15, 'wind → het waait (it is windy)', 92);
