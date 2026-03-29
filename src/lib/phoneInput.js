/**
 * Нормализация ввода российского номера для полей «как +7XXXXXXXXXX».
 *
 * - Начало с + — не меняем (кроме чистки лишних +).
 * - Начало с 7 или 8 — как раньше: +7 и дальше без первой цифры (7914… → +7914…, 8914… → +7914…).
 * - Любая другая первая цифра (0–6, 9) — перед всей строкой ставим +7, первую цифру не удаляем (+7914…, +709…).
 */
export function normalizeRuPhoneInput(raw) {
  let value = String(raw ?? '').replace(/[^0-9+]/g, '');

  if (value.indexOf('+', 1) !== -1) {
    value = value.replace(/\+/g, '');
    value = `+${value}`;
  }

  if (!value) return '';

  const first = value[0];

  if (first === '+') {
    return value.trim();
  }

  if (first === '7' || first === '8') {
    return `+7${value.slice(1)}`.trim();
  }

  return `+7${value}`.trim();
}
