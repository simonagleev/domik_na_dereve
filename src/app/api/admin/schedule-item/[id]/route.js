import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';
import { naiveIrkutskRowToStartDateTimeString } from '@/lib/irkutskTime';

/**
 * Время начала слота и название мероприятия по item_id из транзакции.
 * Query: type=show | workshop — id слота уникален только в своей таблице.
 * Ответ: { start_datetime, event_name }
 */
export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const id = params?.id;
  const numericId = Number(id);
  if (id == null || id === '' || Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const txType = searchParams.get('type')?.trim();
  if (txType !== 'show' && txType !== 'workshop') {
    return NextResponse.json(
      { error: 'Укажите type=show (спектакль) или type=workshop (мастер-класс)' },
      { status: 400 }
    );
  }

  try {
    const sql =
      txType === 'show'
        ? `
        SELECT
          to_char(ss.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime,
          s.name AS event_name
        FROM shows_schedule ss
        LEFT JOIN shows s ON s.id = ss.show_id
        WHERE ss.id = $1
        `
        : `
        SELECT
          to_char(ws.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime,
          w.name AS event_name
        FROM workshop_schedule ws
        LEFT JOIN workshops w ON w.id = ws.workshop_id
        WHERE ws.id = $1
        `;

    const { rows } = await pgQuery(sql, [numericId]);
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: 'Запись в расписании не найдена' }, { status: 404 });
    }

    const start_datetime =
      row.start_datetime != null && row.start_datetime !== ''
        ? naiveIrkutskRowToStartDateTimeString(row.start_datetime)
        : null;

    const event_name =
      row.event_name != null && String(row.event_name).trim() !== ''
        ? String(row.event_name).trim()
        : null;

    return NextResponse.json({ start_datetime, event_name });
  } catch (error) {
    console.error('schedule-item', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка запроса к базе' },
      { status: 500 }
    );
  }
}
