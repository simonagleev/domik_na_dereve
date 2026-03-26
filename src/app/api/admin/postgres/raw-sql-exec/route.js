import { NextResponse } from 'next/server';
import { getAdminPayload } from '@/lib/adminAuth';
import { pgQuery } from '@/lib/postgres';

function normalizeSql(sql) {
  return String(sql || '').trim();
}

function isSingleStatement(sql) {
  return !sql.includes(';');
}

function isMutatingSql(sql) {
  const s = sql.toLowerCase();
  return s.startsWith('insert ') || s.startsWith('update ') || s.startsWith('delete ');
}

function hasWhereForSensitiveMutations(sql) {
  const s = sql.toLowerCase();
  if (s.startsWith('update ') || s.startsWith('delete ')) {
    return s.includes(' where ');
  }
  return true;
}

export async function POST(request) {
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
    if (!isSingleStatement(sql)) {
      return NextResponse.json({ error: 'Разрешен только один SQL statement' }, { status: 400 });
    }
    if (!isMutatingSql(sql)) {
      return NextResponse.json(
        { error: 'В этом endpoint разрешены только INSERT/UPDATE/DELETE' },
        { status: 400 }
      );
    }
    if (!hasWhereForSensitiveMutations(sql)) {
      return NextResponse.json(
        { error: 'UPDATE/DELETE без WHERE запрещены' },
        { status: 400 }
      );
    }

    const result = await pgQuery(sql, params);
    return NextResponse.json({
      data: result.rows ?? [],
      affected: result.rowCount ?? 0,
      command: result.command ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка SQL запроса' }, { status: 400 });
  }
}

