import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { getAdminPayload } from '@/lib/adminAuth';

const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

export async function GET(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || '25', 10) || 25;
  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) {
    pageSize = 25;
  }

  const dateFrom = searchParams.get('dateFrom')?.trim() || '';
  const dateTo = searchParams.get('dateTo')?.trim() || '';
  const phone = searchParams.get('phone')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';

  const offset = (page - 1) * pageSize;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (dateFrom) {
    conditions.push(`created_at >= $${idx}::timestamptz`);
    params.push(`${dateFrom}T00:00:00`);
    idx += 1;
  }
  if (dateTo) {
    conditions.push(`created_at <= $${idx}::timestamptz`);
    params.push(`${dateTo}T23:59:59.999`);
    idx += 1;
  }
  if (phone) {
    conditions.push(`phone ILIKE $${idx}`);
    params.push(`%${phone}%`);
    idx += 1;
  }
  if (type) {
    conditions.push(`"type" = $${idx}`);
    params.push(type);
    idx += 1;
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countRes = await pgQuery(
      `SELECT COUNT(*)::bigint AS c FROM feedback_requests ${whereSql}`,
      params
    );
    const total = Number(countRes.rows[0]?.c ?? 0);

    const dataParams = [...params, pageSize, offset];
    const limitIdx = idx;
    const offsetIdx = idx + 1;

    const dataRes = await pgQuery(
      `
      SELECT id, created_at, name, phone, type, child_name, child_age, event_date
      FROM feedback_requests
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      dataParams
    );

    const typesRes = await pgQuery(
      `SELECT id, "type", name FROM feedback_request_types ORDER BY id ASC`,
      []
    );

    return NextResponse.json({
      data: dataRes.rows ?? [],
      total,
      page,
      pageSize,
      types: typesRes.rows ?? [],
    });
  } catch (error) {
    console.error('get-feedback-requests', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка запроса к базе' },
      { status: 500 }
    );
  }
}
