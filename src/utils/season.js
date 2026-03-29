/** Месяц 0–11 (как в Date): весна 2–4, лето 5–7, осень 8–10, зима остальное */
export function getSeason(month) {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Текущий календарный месяц в Иркутске (0–11), чтобы сезон на сайте совпадал с местным временем,
 * а не с часовым поясом сервера (VPS часто в UTC).
 */
export function getCurrentMonthIndexIrkutsk() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Irkutsk',
      month: 'numeric',
    }).formatToParts(new Date());
    const m = parts.find((p) => p.type === 'month')?.value;
    if (m != null) return Number(m) - 1;
  } catch (_) {
    /* fallback */
  }
  return new Date().getMonth();
}

/** Сезон по текущей дате в Иркутске — вызывать при рендере, не на уровне модуля. */
export function getSeasonIrkutskNow() {
  return getSeason(getCurrentMonthIndexIrkutsk());
}
