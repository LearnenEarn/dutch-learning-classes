/**
 * Minimal i18n helper for EN/FA UI strings.
 * Keys are English by default; Farsi overrides supplied where needed.
 */

type LangKey = 'en' | 'fa';

const strings: Record<string, Record<LangKey, string>> = {
  // Navigation
  'nav.dashboard':    { en: 'Dashboard', fa: 'داشبورد' },
  'nav.lessons':      { en: 'Lessen', fa: 'درس‌ها' },
  'nav.profile':      { en: 'Profiel', fa: 'پروفایل' },
  'nav.logout':       { en: 'Uitloggen', fa: 'خروج' },

  // Auth
  'auth.login':       { en: 'Inloggen', fa: 'ورود' },
  'auth.register':    { en: 'Registreren', fa: 'ثبت‌نام' },
  'auth.email':       { en: 'E-mail', fa: 'ایمیل' },
  'auth.password':    { en: 'Wachtwoord', fa: 'رمز عبور' },
  'auth.name':        { en: 'Naam', fa: 'نام' },
  'auth.welcome':     { en: 'Welkom Terug', fa: 'خوش برگشتید' },

  // Dashboard
  'dash.morning':     { en: 'Goedemorgen 👋', fa: 'صبح بخیر 👋' },
  'dash.xp':          { en: 'XP totaal', fa: 'مجموع XP' },
  'dash.streak':      { en: 'Dagen actief', fa: 'روزهای فعال' },
  'dash.completed':   { en: 'Lessen voltooid', fa: 'درس‌های تکمیل‌شده' },
  'dash.progress':    { en: 'Voortgang', fa: 'پیشرفت' },
  'dash.yourlessons': { en: 'Jouw Lessen', fa: 'درس‌های شما' },
  'dash.badges':      { en: 'Jouw Badges', fa: 'نشان‌های شما' },

  // Lessons
  'lesson.week':      { en: 'Week', fa: 'هفته' },
  'lesson.exercises': { en: 'oefeningen', fa: 'تمرین' },
  'lesson.soon':      { en: 'Binnenkort', fa: 'به‌زودی' },
  'lesson.completed': { en: 'Voltooid', fa: 'تکمیل شد' },
  'lesson.back':      { en: '← Terug', fa: '← بازگشت' },

  // Games
  'game.flip':        { en: 'Tik om te draaien', fa: 'برای چرخاندن کلیک کنید' },
  'game.known':       { en: '✅ Geweten!', fa: '✅ بلدم!' },
  'game.review':      { en: '😅 Nog oefenen', fa: '😅 بیشتر تمرین' },
  'game.check':       { en: '✓ Controleer', fa: '✓ بررسی' },
  'game.restart':     { en: '🔄 Opnieuw spelen', fa: '🔄 بازی دوباره' },
  'game.hint':        { en: '💡 Toon hint', fa: '💡 نشان دادن راهنما' },
  'game.correct':     { en: '✅ Correct! Goed gedaan!', fa: '✅ درسته! آفرین!' },
  'game.type':        { en: 'Typ het ontbrekende woord...', fa: 'کلمه کم را تایپ کنید...' },
  'game.meaning':     { en: 'Wat betekent dit?', fa: 'این چه معنایی دارد؟' },

  // Profile
  'profile.title':    { en: 'Mijn Profiel', fa: 'پروفایل من' },
  'profile.lang':     { en: 'Taalkeuze', fa: 'انتخاب زبان' },
  'profile.langdesc': { en: 'Kies welke taal je naast Nederlands wilt zien:', fa: 'زبانی که می‌خواهید کنار هلندی ببینید:' },
  'profile.attempts': { en: 'Pogingen', fa: 'تلاش‌ها' },
  'profile.nobadges': { en: 'Voltooi lessen om badges te verdienen!', fa: 'درس‌ها را تکمیل کنید تا نشان بگیرید!' },
};

/**
 * Translate a key into the given language.
 * Falls back to English if the FA translation is missing.
 */
export function t(key: string, lang: LangKey): string {
  const entry = strings[key];
  if (!entry) return key; // Return key as fallback
  return entry[lang] ?? entry['en'] ?? key;
}

/** Helper hook-like function to create a translator bound to a language */
export function useT(lang: LangKey) {
  return (key: string) => t(key, lang);
}
