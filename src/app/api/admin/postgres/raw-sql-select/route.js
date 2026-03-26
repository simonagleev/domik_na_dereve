import { NextResponse } from 'next/server';
import { getAdminPayload } from '@/lib/adminAuth';
import { pgQuery } from '@/lib/postgres';


// Только для sql запросов с SELECTs.

function normalizeSql(sql) {
  return String(sql || '').trim();
}

function isSelectOnly(sql) {
  const s = sql.toLowerCase();
  // Разрешаем только SELECT/WITH ... SELECT, без модификации данных
  if (!(s.startsWith('select ') || s.startsWith('with '))) return false;
  // Один стейтмент: без ';'
  if (s.includes(';')) {
    console.log('INCLUDES ;')
    return false;
  }

  const forbidden = [
    ' insert ',
    ' update ',
    ' delete ',
    ' drop ',
    ' alter ',
    ' truncate ',
    ' create ',
    ' grant ',
    ' revoke ',
    ' execute ',
    ' call ',
    ' copy ',
    ' merge ',
  ];

  return !forbidden.some((kw) => s.includes(kw));
}

export async function POST(request) {
  console.log('POST request STARTED');

  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет админского доступа' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sql = normalizeSql(body?.sql);
    const params = Array.isArray(body?.params) ? body.params : [];

    if (!sql) {
      return NextResponse.json({ error: 'Field "sql" is required' }, { status: 400 });
    }
    if (!isSelectOnly(sql)) {
      console.log('POST request FAILED');
      console.log(sql);
      return NextResponse.json(
        { error: 'Разрешены только одиночные SELECT-запросы без изменения данных' },
        { status: 400 }
      );
    }

    const result = await pgQuery(sql, params);
    return NextResponse.json({
      data: result.rows ?? [],
      rowCount: result.rowCount ?? 0,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка SQL запроса' }, { status: 400 });
  }
}

