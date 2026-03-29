import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';

export async function GET(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  try {
    const { rows } = await pgQuery(
      `
      SELECT id, created_at, name, is_active, sort_order, tech_name
      FROM event_types
      WHERE is_active = true
      ORDER BY sort_order ASC
      `,
      []
    );

    return NextResponse.json(rows ?? []);
  } catch (error) {
    console.error('event-types', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка запроса к базе' },
      { status: 500 }
    );
  }
}
