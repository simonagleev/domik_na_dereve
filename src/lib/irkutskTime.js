/**
 * Расписание: в БД хранится `timestamp without time zone` как «настенное» время Иркутска.
 * Не используем toISOString() для этих полей — иначе сдвиг в UTC.
 */

export const IRKUTSK_TIMEZONE = 'Asia/Irkutsk';

/**
 * Сегодняшняя дата по календарю Иркутска (YYYY-MM-DD).
 * Для `min` у input type="date" — без сдвига UTC, как у `toISOString().split('T')[0]`.
 */
export function irkutskTodayDateString() {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IRKUTSK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

/** Порог для фильтра «после сейчас + 1 ч» в том же формате, что и в колонке (Иркутск). */
export function irkutskCutoffPlusOneHourString() {
  const ms = Date.now() + 60 * 60 * 1000;
  const d = new Date(ms);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IRKUTSK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    // В некоторых окружениях часовой цикл "h24" может вернуть "24" вместо "00"
    // (например, "24:57"). Для PostgreSQL это невалидно, поэтому форсируем 00–23.
    hourCycle: 'h23',
  }).formatToParts(d);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const hh = map.hour === '24' ? '00' : map.hour;
  return `${map.year}-${map.month}-${map.day} ${hh}:${map.minute}:${map.second}`;
}

/**
 * Разбор строки слота: `YYYY-MM-DDTHH:mm:ss` или `YYYY-MM-DD HH:mm:ss` (без Z).
 * @returns {{ date: string, time: string }} date = YYYY-MM-DD, time = HH:mm
 */
export function parseNaiveIrkutskDateTimeParts(value) {
  if (value == null || value === '') return { date: '', time: '' };
  const s = String(value).trim().replace(/Z$/i, '');
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s);
  if (!m) return { date: '', time: '' };
  return { date: m[1], time: `${m[2]}:${m[3]}` };
}

/** Для API поля StartDateTime: одна строка без смещения. */
export function naiveIrkutskRowToStartDateTimeString(rowValue) {
  if (rowValue == null || rowValue === '') return '';
  if (typeof rowValue === 'string') {
    const t = rowValue.trim();
    if (t.includes('T')) return t.slice(0, 19);
    return t.replace(' ', 'T').slice(0, 19);
  }
  return String(rowValue);
}

/**
 * Таблица админки: ДД.ММ.ГГГГ, ЧЧ:ММ
 */
export function formatNaiveIrkutskForAdminTable(value) {
  const { date, time } = parseNaiveIrkutskDateTimeParts(value);
  if (!date || !time) {
    if (value != null && value !== '') return String(value);
    return '—';
  }
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}, ${time}`;
}

/**
 * Всплывашка транзакций: datePart ГГГГ.ММ.ДД; timePart ЧЧ:ММ
 */
export function formatNaiveIrkutskForTransactionPopup(value) {
  const { date, time } = parseNaiveIrkutskDateTimeParts(value);
  if (!date || !time) {
    return { datePart: '—', timePart: '—' };
  }
  const [y, m, d] = date.split('-');
  return {
    datePart: `${y}.${m}.${d}`,
    timePart: time,
  };
}

const RU_MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/** Карточка МК: «30 марта в 15:00» по полям строки Иркутска. */
export function formatNaiveIrkutskWorkshopCardLine(startDateTime) {
  const { date, time } = parseNaiveIrkutskDateTimeParts(startDateTime);
  if (!date || !time) return '—';
  const [y, mo, da] = date.split('-').map(Number);
  const monthName = RU_MONTHS_GEN[mo - 1] || '';
  return `${String(da).padStart(2, '0')} ${monthName} в ${time}`;
}
