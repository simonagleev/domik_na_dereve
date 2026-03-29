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
  const status = searchParams.get('status')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';
  const phone = searchParams.get('phone')?.trim() || '';
  const orderSearch = searchParams.get('orderSearch')?.trim() || '';

  const offset = (page - 1) * pageSize;

  const conditions = [];
  const params = [];
  let i = 1;

  if (dateFrom) {
    conditions.push(`created_at >= $${i}::timestamptz`);
    params.push(`${dateFrom}T00:00:00`);
    i += 1;
  }
  if (dateTo) {
    conditions.push(`created_at <= $${i}::timestamptz`);
    params.push(`${dateTo}T23:59:59.999`);
    i += 1;
  }
  if (status) {
    conditions.push(`status = $${i}`);
    params.push(status);
    i += 1;
  }
  if (type) {
    conditions.push(`type = $${i}`);
    params.push(type);
    i += 1;
  }
  if (phone) {
    conditions.push(`phone ILIKE $${i}`);
    params.push(`%${phone}%`);
    i += 1;
  }
  if (orderSearch) {
    conditions.push(`order_acquiring_id::text ILIKE $${i}`);
    params.push(`%${orderSearch}%`);
    i += 1;
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countRes = await pgQuery(
      `SELECT COUNT(*)::bigint AS c FROM online_transactions ${whereSql}`,
      params
    );
    const total = Number(countRes.rows[0]?.c ?? 0);

    const dataParams = [...params, pageSize, offset];
    const limitIdx = i;
    const offsetIdx = i + 1;

    const dataRes = await pgQuery(
      `
      SELECT
        id,
        created_at,
        order_acquiring_id,
        phone,
        status,
        "date",
        amount,
        type,
        item_id,
        info,
        ticket_count,
        child_name,
        client_name
      FROM online_transactions
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      dataParams
    );

    return NextResponse.json({
      data: dataRes.rows ?? [],
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('get-all-online-transactions', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка запроса к базе' },
      { status: 500 }
    );
  }
}
