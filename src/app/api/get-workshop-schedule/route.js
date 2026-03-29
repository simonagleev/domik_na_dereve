import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { shouldIncludeTestScheduleSlots } from '@/lib/scheduleTestSlots';
import { irkutskCutoffPlusOneHourString, naiveIrkutskRowToStartDateTimeString } from '@/lib/irkutskTime';

export const dynamic = 'force-dynamic';

function imageFileNameFromPath(imagePath) {
  if (imagePath == null || String(imagePath).trim() === '') return 'venok_bg.svg';
  const s = String(imagePath).trim();
  const parts = s.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : 'venok_bg.svg';
}

/**
 * Расписание мастер-классов для публичной страницы /workshops.
 * [Раньше: Supabase таблица workshopSchedule — см. старый роут.]
 */
export async function GET(request) {
  try {
    const cutoff = irkutskCutoffPlusOneHourString();
    const includeTestSlots = shouldIncludeTestScheduleSlots(request);

    const { rows } = await pgQuery(
      `
      SELECT
        ws.id,
        to_char(ws.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime,
        ws.remaining_count,
        ws.comments AS slot_comments,
        w.id AS workshop_id,
        w.name,
        w.price,
        w.description,
        w.comments AS workshop_comments,
        w.duration,
        w.age,
        w.image_path
      FROM workshop_schedule ws
      INNER JOIN workshops w ON w.id = ws.workshop_id
      WHERE ws.is_active = true
        AND ws.start_datetime > $1::timestamp
        AND (
          $2::boolean
          OR NOT (
            LOWER(COALESCE(ws.comments, '')) LIKE '%test%'
            OR LOWER(COALESCE(ws.comments, '')) LIKE '%тест%'
          )
        )
      ORDER BY ws.start_datetime ASC
    `,
      [cutoff, includeTestSlots]
    );

    const data = rows.map((r) => {
      const start = naiveIrkutskRowToStartDateTimeString(r.start_datetime);
      const imagePath = r.image_path != null ? String(r.image_path).trim() : '';
      const imageSrc = imagePath.startsWith('/') ? imagePath : imagePath ? `/img/workshops/${imagePath}` : '/img/workshops/venok_bg.svg';
      const durationMin = r.duration != null && r.duration !== '' ? Number(r.duration) : null;
      const durationLabel =
        durationMin != null && Number.isFinite(durationMin) ? `${Math.round(durationMin)} мин` : '—';

      return {
        ID: r.id,
        StartDateTime: start,
        RemainingCount: Number(r.remaining_count ?? 0),
        Price: Number(r.price ?? 0),
        Name: r.name ?? '',
        Description: r.description ?? '',
        Duration: durationLabel,
        Age: r.age,
        Comments:
          r.slot_comments != null && String(r.slot_comments).trim() !== ''
            ? String(r.slot_comments)
            : r.workshop_comments != null
              ? String(r.workshop_comments)
              : '',
        ImageName: imageFileNameFromPath(imagePath),
        ImageSrc: imageSrc,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('get-workshop-schedule GET', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка загрузки расписания' },
      { status: 500 }
    );
  }
}
