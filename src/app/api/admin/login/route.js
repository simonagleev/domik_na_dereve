import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // только на сервере!
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET; // задай в .env.local

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

  // 1. Ищем пользователя в БД
  const { data: user, error } = await supabase
    .from('users')
    .select('ID, Email, PasswordHash, Role')
    .eq('Email', normalizedEmail)
    .maybeSingle();

  if (error ) {
    console.log(' error123');
    console.log(error);
    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error:'Пользователь с таким Email не найден' },
      { status: 401 }
    );
  }

  // 2. Проверяем пароль
  if (!user.PasswordHash || !user.PasswordHash.startsWith('$2')) {
    return NextResponse.json(
      { error: 'Пароль в БД не в bcrypt-формате. Обновите PasswordHash.' },
      { status: 500 }
    );
  }

  const isValid = await bcrypt.compare(password, user.PasswordHash);
  const normalizedRole = String(user.Role || '').trim().toLowerCase();
  if (normalizedRole !== 'admin') {
    return NextResponse.json(
      { error: isProd ? 'Неверный логин или пароль' : `Недостаточно прав. Role="${user.Role}"` },
      { status: 401 }
    );
  }

  if (!isValid) {
    return NextResponse.json(
      { error: isProd ? 'Неверный логин или пароль' : 'Пароль не совпадает с PasswordHash' },
      { status: 401 }
    );
  }

  // 3. Генерим JWT
  const token = jwt.sign(
    { userId: user.Id, email: user.Email, role: normalizedRole },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 4. Кладём в httpOnly cookie
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