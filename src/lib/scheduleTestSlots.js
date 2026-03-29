import { getAdminPayload } from '@/lib/adminAuth';

/**
 * Слот считается тестовым, если в комментарии к слоту (shows_schedule / workshop_schedule)
 * есть подстрока «test» или «тест» (без учёта регистра).
 */
export function isCommentMarkedTest(comment) {
  if (comment == null) return false;
  const s = String(comment).toLowerCase();
  return s.includes('test') || s.includes('тест');
}

/**
 * Тестовые слоты видны в расписании и доступны к оплате только в development
 * или при запросе с админской cookie (можно проверять на проде под админом).
 */
export function shouldIncludeTestScheduleSlots(request) {
  if (process.env.NODE_ENV === 'development') return true;
  return getAdminPayload(request) != null;
}
