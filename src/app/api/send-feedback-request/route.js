import { pgQuery } from '@/lib/postgres';

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.phone || !data.type) {
      return new Response(JSON.stringify({ error: 'Не все данные переданы' }), { status: 400 });
    }

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
      [
        data.name,
        data.phone,
        data.type,
        data.childName ?? null,
        data.childAge ? Number(data.childAge) : null,
        data.eventDate ? data.eventDate : 'Дата не указана',
      ]
    );

    return new Response(JSON.stringify({ success: true, received: data }), { status: 200 });
  } catch (error) {
    console.error('Ошибка записи заявки (Postgres):', error);
    return new Response(JSON.stringify({ error: 'Ошибка записи в базу данных' }), { status: 500 });
  }
}
