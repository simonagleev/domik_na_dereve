import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

/**
 * Карточки творческих мастерских для публичной страницы /creativeWorkshops.
 */
export async function GET() {
  try {
    const { rows } = await pgQuery(
      `
      SELECT id, name, price, description, age, image_path, schedule, sort_order
      FROM creative_workshops
      WHERE is_active = true
      ORDER BY sort_order ASC, id ASC
      `,
      []
    );

    const data = (rows ?? []).map((r) => ({
      id: r.id,
      name: r.name ?? '',
      price: Number(r.price ?? 0),
      description: r.description ?? '',
      age: r.age ?? null,
      imageUrl: r.image_path != null ? String(r.image_path).trim() : '',
      schedule: Array.isArray(r.schedule) ? r.schedule : [],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('get-creative-workshops GET', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка загрузки творческих мастерских' },
      { status: 500 }
    );
  }
}
