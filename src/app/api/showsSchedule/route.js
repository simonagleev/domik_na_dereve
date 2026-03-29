import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { shouldIncludeTestScheduleSlots } from '@/lib/scheduleTestSlots';
import { irkutskCutoffPlusOneHourString, naiveIrkutskRowToStartDateTimeString } from '@/lib/irkutskTime';

export const dynamic = 'force-dynamic';

/**
 * Ответ: массив объектов по спектаклям с полем schedules (как раньше по форме),
 * чтобы карточки и модалка не ломались.
 */
export async function GET(request) {
  try {
    const cutoff = irkutskCutoffPlusOneHourString();
    const includeTestSlots = shouldIncludeTestScheduleSlots(request);

    const { rows } = await pgQuery(
      `
      SELECT
        ss.id AS slot_id,
        to_char(ss.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime,
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
        AND (
          $2::boolean
          OR NOT (
            LOWER(COALESCE(ss.comments, '')) LIKE '%test%'
            OR LOWER(COALESCE(ss.comments, '')) LIKE '%тест%'
          )
        )
      ORDER BY ss.start_datetime ASC
    `,
      [cutoff, includeTestSlots]
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

      const start = naiveIrkutskRowToStartDateTimeString(r.start_datetime);

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
      const sa = a.schedules[0]?.StartDateTime || '';
      const sb = b.schedules[0]?.StartDateTime || '';
      return String(sa).localeCompare(String(sb));
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
