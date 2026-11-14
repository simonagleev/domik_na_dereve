/** Не больше 11 цифр (7 + 10 знаков номера), формат +7XXXXXXXXXX. */
const RU_PHONE_MAX_DIGITS = 11;

function capRuPhoneTo11Digits(formatted) {
  let digits = String(formatted).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length > RU_PHONE_MAX_DIGITS) {
    digits = digits.slice(0, RU_PHONE_MAX_DIGITS);
  }
  if (digits[0] === '8') {
    digits = `7${digits.slice(1)}`;
  }
  if (digits[0] !== '7') {
    digits = `7${digits}`.slice(0, RU_PHONE_MAX_DIGITS);
  }

  const rest = digits.slice(1);
  return rest ? `+7${rest}` : '+7';
}

/**
 * Нормализация ввода российского номера для полей «как +7XXXXXXXXXX».
 *
 * - Начало с + - не меняем (кроме чистки лишних +).
 * - Начало с 7 или 8 - как раньше: +7 и дальше без первой цифры (7914… → +7914…, 8914… → +7914…).
 * - Любая другая первая цифра (0–6, 9) - перед всей строкой ставим +7, первую цифру не удаляем (+7914…, +709…).
 * - В номере не больше 11 цифр.
 */
export function normalizeRuPhoneInput(raw) {
  let value = String(raw ?? '').replace(/[^0-9+]/g, '');

  if (value.indexOf('+', 1) !== -1) {
    value = value.replace(/\+/g, '');
    value = `+${value}`;
  }

  if (!value) return '';

  const first = value[0];

  let normalized;
  if (first === '+') {
    normalized = value.trim();
  } else if (first === '7' || first === '8') {
    normalized = `+7${value.slice(1)}`.trim();
  } else {
    normalized = `+7${value}`.trim();
  }

  return capRuPhoneTo11Digits(normalized);
}
