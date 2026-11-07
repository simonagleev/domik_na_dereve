/**
 * Миграция: таблица questionnaires - уникальные анкеты с доступом по ссылке (без регистрации).
 *
 * Запуск: node scripts/migrate-questionnaires.js
 *
 * Идемпотентна: CREATE TABLE IF NOT EXISTS - можно запускать повторно.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const connectionString = env.POSTGRES_URL || env.POSTGRES_CONNECTION_STRING;
if (!connectionString) {
  console.error('POSTGRES_URL не найден в .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString });

const DDL = `
  CREATE TABLE IF NOT EXISTS questionnaires (
    id          bigserial PRIMARY KEY,
    -- токен - это и есть «ссылка»: /anketa/<token>. Кто имеет ссылку, тот и редактирует анкету.
    token       uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    -- тип анкеты ('ded_moroz', ...). Под новый вид добавляем значение + рендер формы, таблица общая.
    type        text NOT NULL,
    -- 'new' | 'in_progress' | 'completed'
    status      text NOT NULL DEFAULT 'new',
    -- дубли payload.answers.name для удобства списка в админке (заполняется при сохранении анкеты)
    child_name  text,
    phone       text,
    email       text,
    -- сколько textarea «N-й год» показывать в блоке достижений (задаётся при создании в админке)
    years_count integer NOT NULL DEFAULT 7 CHECK (years_count > 0 AND years_count <= 21),
    -- все ответы анкеты; структуру ключаем под тип (answers: {...}, achievements: [...])
    payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    expires_at  timestamptz NOT NULL DEFAULT (now() + interval '3 months'),
    -- когда админ закрыл анкету вручную (NULL = не закрыта); срок жизни отдельно в expires_at
    closed_at   timestamptz
  )
`;

// Для БД, где таблица уже существовала без closed_at
const ALTER_DDL = `
  ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS closed_at timestamptz
`;

const INDEX_DDL = `
  CREATE INDEX IF NOT EXISTS idx_questionnaires_type_created
  ON questionnaires (type, created_at DESC)
`;

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(DDL);
    await client.query(ALTER_DDL);
    await client.query(INDEX_DDL);
    await client.query('COMMIT');

    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'questionnaires'
      ORDER BY ordinal_position
    `);
    console.log('Таблица questionnaires готова. Колонки:');
    console.log(rows.map((r) => `  ${r.column_name}: ${r.data_type}`).join('\n'));
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
