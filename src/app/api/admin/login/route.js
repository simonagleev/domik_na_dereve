import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findAdminUserInPostgres } from '@/lib/adminLoginProviders';

const JWT_SECRET = process.env.JWT_SECRET;

function normalizeAdminRole(role) {
  return String(role ?? '').trim().toLowerCase();
}

function buildTokenCookieResponse(userId, email) {
  const token = jwt.sign(
    { userId, email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

async function verifyBcryptAdminUser({ passwordHashField, roleField, password, isProd, devWrongPasswordHint }) {
  if (!passwordHashField || !String(passwordHashField).startsWith('$2')) {
    return {
      error: 'Пароль в БД не в bcrypt-формате. Обновите password_hash.',
      status: 500,
    };
  }

  const isValid = await bcrypt.compare(password, passwordHashField);
  const roleNorm = normalizeAdminRole(roleField);

  if (roleNorm !== 'admin') {
    return {
      error: isProd ? 'Неверный логин или пароль' : `Недостаточно прав. Role="${roleField}"`,
      status: 401,
    };
  }

  if (!isValid) {
    return {
      error: isProd ? 'Неверный логин или пароль' : devWrongPasswordHint,
      status: 401,
    };
  }

  return { ok: true };
}

export async function POST(request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email || '').trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (!JWT_SECRET) {
    return NextResponse.json({ error: 'Не настроен JWT_SECRET на сервере' }, { status: 500 });
  }

  if (!normalizedEmail || !password) {
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
  }

  const pg = await findAdminUserInPostgres(normalizedEmail);

  if (pg.mode === 'no_config') {
    return NextResponse.json(
      { error: 'Не настроено подключение к PostgreSQL (POSTGRES_URL или POSTGRES_CONNECTION_STRING)' },
      { status: 500 }
    );
  }

  if (pg.mode === 'error') {
    return NextResponse.json(
      { error: 'База данных временно недоступна. Попробуйте позже.' },
      { status: 503 }
    );
  }

  if (pg.mode === 'not_found' || !pg.user) {
    return NextResponse.json(
      { error: isProd ? 'Неверный логин или пароль' : 'Пользователь с таким email не найден в PostgreSQL' },
      { status: 401 }
    );
  }

  const v = await verifyBcryptAdminUser({
    passwordHashField: pg.user.password_hash,
    roleField: pg.user.role,
    password,
    isProd,
    devWrongPasswordHint: 'Пароль не совпадает с password_hash',
  });
  if (v.error) {
    return NextResponse.json({ error: v.error }, { status: v.status });
  }

  console.log('[admin login] Авторизация: PostgreSQL', {
    email: normalizedEmail,
    userId: pg.user.id,
  });
  return buildTokenCookieResponse(pg.user.id, pg.user.email);
}
