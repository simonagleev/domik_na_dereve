import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';

/** Пока список/запись реализованы только для shows */
const SUPPORTED_LIST = new Set(['shows']);

export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const techName = params?.techName;
  if (!techName || !SUPPORTED_LIST.has(techName)) {
    return NextResponse.json([]);
  }

  try {
    const { rows } = await pgQuery('SELECT * FROM shows ORDER BY id ASC', []);
    return NextResponse.json(rows ?? []);
  } catch (error) {
    console.error(`GET events/${techName}`, error);
    return NextResponse.json({ error: error?.message || 'Ошибка запроса' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const techName = params?.techName;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Создание пока только для shows' }, { status: 400 });
  }

  const body = await request.json();

  const peoplePerTicket =
    body.people_per_ticket == null || body.people_per_ticket === ''
      ? 1
      : Math.max(1, Number(body.people_per_ticket) || 1);

  try {
    const { rows } = await pgQuery(
      `
      INSERT INTO shows (
        name, price, max_tickets, description, comments,
        image_name, image_path, age, duration, people_per_ticket
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        body.name ?? '',
        Number(body.price) || 0,
        body.max_tickets ?? 0,
        body.description ?? null,
        body.comments ?? null,
        body.image_name ?? null,
        body.image_path ?? null,
        body.age ?? null,
        body.duration ?? null,
        peoplePerTicket,
      ]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('POST shows', error);
    return NextResponse.json({ error: error?.message || 'Ошибка записи' }, { status: 500 });
  }
}
