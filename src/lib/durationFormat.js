function pluralRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/**
 * Преобразует длительность в минутах (или строку вида "1.24") в человекочитаемый вид на русском.
 */
export function formatDurationRu(input) {
  if (input == null || input === '') return '—';

  let totalMinutes;
  if (typeof input === 'string' && input.includes('.')) {
    const [h, m = '0'] = input.split('.');
    totalMinutes = (Number(h) || 0) * 60 + (Number(m) || 0);
  } else {
    totalMinutes = Number(input);
  }

  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return '—';

  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} ${pluralRu(mins, 'минута', 'минуты', 'минут')}`;
  }

  if (mins === 0) {
    return `${hours} ${pluralRu(hours, 'час', 'часа', 'часов')}`;
  }

  return `${hours} ${pluralRu(hours, 'час', 'часа', 'часов')} ${mins} ${pluralRu(mins, 'минута', 'минуты', 'минут')}`;
}

