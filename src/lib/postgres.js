import { Pool } from 'pg';

/**
 * Пул соединений: переиспользуем открытые TCP-соединения к Postgres, а не открываем новое на каждый запрос.
 *
 * pgQuery() — обычный запрос через пул: каждый вызов может пойти на РАЗНОЕ соединение из пула.
 * Поэтому BEGIN/COMMIT нельзя «размазать» по двум отдельным pgQuery(): транзакция привязана к одному соединению.
 *
 * BEGIN, COMMIT, ROLLBACK — это не синтаксис JavaScript, а команды языка SQL, которые понимает PostgreSQL.
 * Они задают границы транзакции: «всё между BEGIN и COMMIT либо применится целиком, либо откатится (ROLLBACK)».
 * Это не то же самое, что хранимая процедура в БД: логику мы пишем в Node, а транзакцию просто оборачиваем этими командами.
 *
 * withTransaction(fn) — берёт ОДИН client из пула, выполняет BEGIN, вызывает вашу async-функцию fn(client),
 * передавая туда этот client (все INSERT/UPDATE внутри должны идти через него), затем COMMIT или ROLLBACK при ошибке,
 * и отдаёт client обратно в пул (release). Так INSERT в online_transactions и UPDATE shows_schedule остаются атомарными.
 */

let pool;

function getConnectionConfig() {
  const connectionString =
    process.env.POSTGRES_URL || process.env.POSTGRES_CONNECTION_STRING;
  if (connectionString) {
    return { connectionString };
  }
}

//один пул на процесс, а не новый пул на каждый запрос
export function getPgPool() {
  if (!pool) {
    pool = new Pool(getConnectionConfig());
    pool.on('error', (err) => {
      console.error('Postgres pool error:', err);
    });
  }
  return pool;
}

export async function pgQuery(text, params = []) {
  return getPgPool().query(text, params);
}

/**
 * Выполняет callback в одной транзакции на одном соединении из пула.
 *
 * @param {function(import('pg').PoolClient): Promise<*>} fn — async-функция; аргумент — client, только через него query().
 * @returns {Promise<*>} — то, что вернул fn (если COMMIT прошёл).
 */
export async function withTransaction(fn) {
  const client = await getPgPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

