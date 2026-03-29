import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

/** Как в старой версии: «Иркутск» + 1 час от текущего момента (см. прежний supabase-роут). */
function cutoffDateTimeString() {
  const now = new Date();
  const irkutskOffset = 8 * 60;
  const irkutskTime = new Date(now.getTime() + irkutskOffset * 60 * 1000);
  irkutskTime.setHours(irkutskTime.getHours() + 1);
  return irkutskTime.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Ответ: массив объектов по спектаклям с полем schedules (как раньше по форме),
 * чтобы карточки и модалка не ломались.
 */
export async function GET() {
  try {
    const cutoff = cutoffDateTimeString();

    const { rows } = await pgQuery(
      `
      SELECT
        ss.id AS slot_id,
        ss.start_datetime,
        ss.show_id,
        ss.remaining_count,
        ss.comments AS slot_comments,
        s.name AS show_name,
        s.price,
        s.description,
        s.comments AS show_comments,
        s.age,
        s.image_path,
        s.image_name,
        s.preview_image_path
      FROM shows_schedule ss
      INNER JOIN shows s ON s.id = ss.show_id
      WHERE ss.is_active = true
        AND ss.start_datetime > $1::timestamp
      ORDER BY ss.start_datetime ASC
    `,
      [cutoff]
    );

    const byShow = new Map();

    for (const r of rows) {
      const sid = r.show_id;
      if (!byShow.has(sid)) {
        byShow.set(sid, {
          id: sid,
          name: r.show_name,
          age: r.age,
          image_path: r.image_path,
          image_name: r.image_name,
          preview_image_path: r.preview_image_path,
          schedules: [],
        });
      }

      const start =
        r.start_datetime instanceof Date
          ? r.start_datetime.toISOString()
          : String(r.start_datetime);

      byShow.get(sid).schedules.push({
        ID: r.slot_id,
        ShowID: sid,
        StartDateTime: start,
        RemainingCount: Number(r.remaining_count ?? 0),
        Price: Number(r.price ?? 0),
        Description: r.description ?? '',
        Comments: r.slot_comments != null && String(r.slot_comments).trim() !== ''
          ? String(r.slot_comments)
          : r.show_comments != null
            ? String(r.show_comments)
            : '',
        Age: r.age,
      });
    }

    const groups = Array.from(byShow.values());
    groups.sort((a, b) => {
      const ta = new Date(a.schedules[0]?.StartDateTime || 0).getTime();
      const tb = new Date(b.schedules[0]?.StartDateTime || 0).getTime();
      return ta - tb;
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('showsSchedule GET', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка загрузки расписания' },
      { status: 500 }
    );
  }
}
