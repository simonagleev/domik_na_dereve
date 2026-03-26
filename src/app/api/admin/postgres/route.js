import { NextResponse } from 'next/server';
import { getAdminPayload } from '@/lib/adminAuth';
import { pgQuery } from '@/lib/postgres';

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/; //regex для проверки SQL-идентификаторов (имён таблиц/колонок). Чтобы безопасно вставлять имена таблиц/колонок в SQ

//Если понадобится ограничить доступные таблицы в БД
function parseAllowedTables() {
  const raw = process.env.POSTGRES_ALLOWED_TABLES || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidIdentifier(name) {
  return IDENT_RE.test(name);
}

//проверяет и возвращает имя для SQL в ""
function quoteIdentifier(identifier) {
  if (!isValidIdentifier(identifier)) {
    throw new Error(`Invalid identifier (Неподходящее имя таблицы/колонки): ${identifier}`);
  }
  return `"${identifier}"`;
}

function quoteTablePath(table) {
  const parts = String(table)
    .split('.')
    .map((e) => e.trim())
    .filter(Boolean); //очистка массива от пустых частей

    //можно только такие имена таблиц table, schema.table
  if (!parts.length || parts.length > 2) {
    throw new Error('Invalid table path');
  }

  return parts.map(quoteIdentifier).join('.');
}

//Не используется, это если понадобтся ограничить определенные таблицы
function ensureTableAllowed(table) {
  const allowed = parseAllowedTables();
  if (!allowed.length) return;
  if (!allowed.includes(table)) {
    throw new Error(`Table "${table}" is not allowed`);
  }
}

//генератор SQL-части WHERE + параметров для pg, приводит блок условий к корректному и безопасному виду «один за другим».
function buildWhereClause(where = {}, startIndex = 1) {
  const entries = Object.entries(where).filter(([, e]) => e !== undefined);
  if (!entries.length) {
    return { clause: '', values: [], nextIndex: startIndex };
  }

  const conditions = [];
  const values = [];
  let idx = startIndex;

  for (const [column, value] of entries) {
    conditions.push(`${quoteIdentifier(column)} = $${idx}`);
    values.push(value);
    idx += 1;
  }

  return {
    clause: `WHERE ${conditions.join(' AND ')}`,
    values,
    nextIndex: idx,
  };
}

function parseCommonGetParams(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table')?.trim() || '';
  const limitRaw = searchParams.get('limit');
  const offsetRaw = searchParams.get('offset');
  const orderBy = searchParams.get('orderBy')?.trim() || '';
  const orderDirRaw = (searchParams.get('orderDir') || 'desc').toLowerCase();
  const whereRaw = searchParams.get('where') || '{}';

  if (!table) throw new Error('Query param "table" is required');
  ensureTableAllowed(table);

  const where = JSON.parse(whereRaw);
  const limit = limitRaw ? Math.max(1, Number(limitRaw)) : 100;
  const offset = offsetRaw ? Math.max(0, Number(offsetRaw)) : 0;
  const orderDir = orderDirRaw === 'asc' ? 'ASC' : 'DESC';

  if (!Number.isFinite(limit) || !Number.isFinite(offset)) {
    throw new Error('Invalid limit or offset');
  }

  return { table, where, limit, offset, orderBy, orderDir };
}

export async function GET(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет админского доступа' }, { status: 401 });
  }

  try {
    const { table, where, limit, offset, orderBy, orderDir } = parseCommonGetParams(request);
    const tableSql = quoteTablePath(table);
    const wherePart = buildWhereClause(where, 1);

    const orderSql = orderBy ? `ORDER BY ${quoteIdentifier(orderBy)} ${orderDir}` : '';
    const dataSql = `
      SELECT *
      FROM ${tableSql}
      ${wherePart.clause}
      ${orderSql}
      LIMIT $${wherePart.nextIndex}
      OFFSET $${wherePart.nextIndex + 1}
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM ${tableSql}
      ${wherePart.clause}
    `;

    const dataValues = [...wherePart.values, limit, offset];
    const countValues = [...wherePart.values];

    const [dataResult, countResult] = await Promise.all([
      pgQuery(dataSql, dataValues),
      pgQuery(countSql, countValues),
    ]);

    return NextResponse.json({
      data: dataResult.rows ?? [],
      total: countResult.rows?.[0]?.total ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка запроса' }, { status: 400 });
  }
}

export async function POST(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const table = String(body?.table || '').trim();
    const data = body?.data;

    if (!table) throw new Error('Field "table" is required');
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Field "data" must be an object');
    }

    ensureTableAllowed(table);
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (!entries.length) throw new Error('No fields provided to insert');

    const columnsSql = entries.map(([k]) => quoteIdentifier(k)).join(', ');
    const valuesSql = entries.map((_, i) => `$${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `
      INSERT INTO ${quoteTablePath(table)} (${columnsSql})
      VALUES (${valuesSql})
      RETURNING *
    `;

    const result = await pgQuery(sql, values);
    return NextResponse.json({ data: result.rows?.[0] ?? null });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка запроса' }, { status: 400 });
  }
}

export async function PATCH(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const table = String(body?.table || '').trim();
    const data = body?.data;
    const where = body?.where;

    if (!table) throw new Error('Field "table" is required');
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Field "data" must be an object');
    }
    if (!where || typeof where !== 'object' || Array.isArray(where)) {
      throw new Error('Field "where" must be an object');
    }

    ensureTableAllowed(table);
    const updates = Object.entries(data).filter(([, v]) => v !== undefined);
    if (!updates.length) throw new Error('No fields provided to update');

    let idx = 1;
    const setParts = [];
    const values = [];
    for (const [column, value] of updates) {
      setParts.push(`${quoteIdentifier(column)} = $${idx}`);
      values.push(value);
      idx += 1;
    }

    const wherePart = buildWhereClause(where, idx);
    if (!wherePart.clause) {
      throw new Error('Refusing to update without where clause');
    }

    const sql = `
      UPDATE ${quoteTablePath(table)}
      SET ${setParts.join(', ')}
      ${wherePart.clause}
      RETURNING *
    `;

    const result = await pgQuery(sql, [...values, ...wherePart.values]);
    return NextResponse.json({ data: result.rows ?? [], affected: result.rowCount ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка запроса' }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const table = String(body?.table || '').trim();
    const where = body?.where;

    if (!table) throw new Error('Field "table" is required');
    if (!where || typeof where !== 'object' || Array.isArray(where)) {
      throw new Error('Field "where" must be an object');
    }

    ensureTableAllowed(table);
    const wherePart = buildWhereClause(where, 1);
    if (!wherePart.clause) {
      throw new Error('Refusing to delete without where clause');
    }

    const sql = `
      DELETE FROM ${quoteTablePath(table)}
      ${wherePart.clause}
      RETURNING *
    `;

    const result = await pgQuery(sql, wherePart.values);
    return NextResponse.json({ data: result.rows ?? [], affected: result.rowCount ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Ошибка запроса' }, { status: 400 });
  }
}

