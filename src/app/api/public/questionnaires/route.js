import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';

const MAX_PAYLOAD_BYTES = 100 * 1024;
const TOKEN_RE = /^[0-9a-fA-F-]{36}$/;

function parseToken(raw) {
  const token = String(raw || '').trim();
  if (!TOKEN_RE.test(token)) return null;
  return token;
}

function closeReason(row) {
  if (row?.closed_at) return 'closed'; // админ закрыл вручную
  if (row?.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return 'expired';
  return null;
}

function toClient(row) {
  return {
    id: row.id,
    type: row.type,
    yearsCount: row.years_count,
    payload: row.payload ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

// GET /api/public/questionnaires?token=<uuid> - предзагрузка анкеты по ссылке
export async function GET(request) {
  try {
    const token = parseToken(new URL(request.url).searchParams.get('token'));
    if (!token) {
      return NextResponse.json({ error: 'Некорректная ссылка' }, { status: 400 });
    }

    const { rows } = await pgQuery(
      `SELECT * FROM questionnaires WHERE token = $1`,
      [token]
    );
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: 'Анкета не найдена' }, { status: 404 });
    }

    const reason = closeReason(row);
    return NextResponse.json({
      questionnaire: toClient(row),
      // закрытую анкету показываем, но без возможности редактировать
      editable: !reason,
      reason, // 'expired' | 'closed' | null
      expiresAt: row.expires_at,
    });
  } catch (error) {
    console.error('Ошибка чтения анкеты (Postgres):', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Оставляем только ожидаемую структуру { answers: {...}, achievements: [...] },
// обрезаем ключи и значения - защита от мусора/злоупотреблений (SQL-инъекции и так закрыты параметризованными запросами).
function sanitizePayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const rawAnswers = raw.answers && typeof raw.answers === 'object' && !Array.isArray(raw.answers) ? raw.answers : {};
  const answers = {};
  for (const [key, value] of Object.entries(rawAnswers).slice(0, 100)) {
    if (typeof key !== 'string' || key.length > 50) continue;
    answers[key] = String(value ?? '').slice(0, 2000);
  }

  const rawAchievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  const achievements = rawAchievements.slice(0, 50).map((value) => String(value ?? '').slice(0, 2000));

  return { answers, achievements };
}

// PUT /api/public/questionnaires - сохранение ответов анкеты по токену
export async function PUT(request) {
  try {
    const body = await request.json();
    const token = parseToken(body?.token);
    if (!token) {
      return NextResponse.json({ error: 'Некорректная ссылка' }, { status: 400 });
    }

    const payload = sanitizePayload(body?.payload);
    if (!payload) {
      return NextResponse.json({ error: 'Некорректные данные анкеты' }, { status: 400 });
    }
    const serialized = JSON.stringify(payload);
    if (serialized.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ error: 'Слишком большой объём данных' }, { status: 413 });
    }

    const childName = payload.answers.name?.trim() || null;

    const { rows } = await pgQuery(
      `
      UPDATE questionnaires
      SET payload = $2::jsonb,
          child_name = COALESCE($3, child_name),
          updated_at = now()
      WHERE token = $1
        AND closed_at IS NULL
        AND expires_at > now()
      RETURNING *
      `,
      [token, serialized, childName]
    );

    const row = rows?.[0];
    if (!row) {
      // либо не найдена, либо закрыта админом, либо истёк срок
      const found = await pgQuery(`SELECT closed_at, expires_at FROM questionnaires WHERE token = $1`, [token]);
      if (!found.rows?.[0]) {
        return NextResponse.json({ error: 'Анкета не найдена' }, { status: 404 });
      }
      const reason = closeReason(found.rows[0]);
      if (reason === 'closed') {
        return NextResponse.json({ error: 'Анкета закрыта для редактирования' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Срок заполнения анкеты истёк' }, { status: 410 });
    }

    return NextResponse.json({ questionnaire: toClient(row) });
  } catch (error) {
    console.error('Ошибка сохранения анкеты (Postgres):', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
