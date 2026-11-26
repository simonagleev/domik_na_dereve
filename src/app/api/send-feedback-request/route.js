import { pgQuery } from '@/lib/postgres';
import { DED_MOROZ_REQUEST_TYPE } from '@/lib/dedMorozRequest';

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.phone || !data.type) {
      return new Response(JSON.stringify({ error: 'Не все данные переданы' }), { status: 400 });
    }

    const baseValues = [
      data.name,
      data.phone,
      data.type,
      data.childName ?? null,
      data.childAge ? Number(data.childAge) : null,
      data.eventDate ? data.eventDate : 'Дата не указана',
    ];

    if (data.type === DED_MOROZ_REQUEST_TYPE) {
      const guestCount = data.guestCount ? Number(data.guestCount) : null;
      const guestAges = String(data.guestAges || '').trim() || null;
      await pgQuery(
        `
        INSERT INTO feedback_requests (
          name,
          phone,
          "type",
          child_name,
          child_age,
          event_date,
          guest_count,
          guest_ages
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          ...baseValues,
          Number.isFinite(guestCount) ? guestCount : null,
          guestAges,
        ]
      );
    } else {
      await pgQuery(
        `
        INSERT INTO feedback_requests (
          name,
          phone,
          "type",
          child_name,
          child_age,
          event_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        baseValues
      );
    }

    return new Response(JSON.stringify({ success: true, received: data }), { status: 200 });
  } catch (error) {
    console.error('Ошибка записи заявки (Postgres):', error);
    return new Response(JSON.stringify({ error: 'Ошибка записи в базу данных' }), { status: 500 });
  }
}
