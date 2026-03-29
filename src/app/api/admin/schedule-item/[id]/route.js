import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';
import { naiveIrkutskRowToStartDateTimeString } from '@/lib/irkutskTime';

/**
 * Время начала слота по item_id из транзакции.
 * Обязательный query: type=show | type=mk — спектаклей и мастер-классов нельзя смешивать;
 * id слота уникален только в своей таблице.
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
        ? `SELECT to_char(start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime FROM shows_schedule WHERE id = $1`
        : `SELECT to_char(start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime FROM workshop_schedule WHERE id = $1`;

    const { rows } = await pgQuery(sql, [numericId]);
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: 'Запись в расписании не найдена' }, { status: 404 });
    }

    const start_datetime =
      row.start_datetime != null && row.start_datetime !== ''
        ? naiveIrkutskRowToStartDateTimeString(row.start_datetime)
        : null;

    return NextResponse.json({ start_datetime });
  } catch (error) {
    console.error('schedule-item', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка запроса к базе' },
      { status: 500 }
    );
  }
}
