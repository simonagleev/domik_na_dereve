import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';

export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { techName, id } = params;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Пока только shows' }, { status: 400 });
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  try {
    const { rows } = await pgQuery('SELECT * FROM shows WHERE id = $1', [numericId]);
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Ошибка запроса' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { techName, id } = params;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Пока только shows' }, { status: 400 });
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const body = await request.json();

  const allowed = [
    'name',
    'price',
    'max_tickets',
    'description',
    'comments',
    'image_name',
    'image_path',
    'age',
    'duration',
    'people_per_ticket',
  ];

  const sets = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      sets.push(`${key} = $${i}`);
      values.push(body[key]);
      i += 1;
    }
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
  }

  values.push(numericId);

  try {
    const { rows } = await pgQuery(
      `UPDATE shows SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error('PATCH shows', error);
    return NextResponse.json({ error: error?.message || 'Ошибка записи' }, { status: 500 });
  }
}
