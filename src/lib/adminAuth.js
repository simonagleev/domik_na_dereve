import jwt from 'jsonwebtoken';

/**
 * Проверка JWT из cookie admin_token. Возвращает payload или null.
 */
export function getAdminPayload(request) {
  const token = request.cookies.get('admin_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (payload?.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}
