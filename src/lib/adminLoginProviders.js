import { pgQuery } from '@/lib/postgres';

function hasPostgresEnv() {
  return !!(
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_CONNECTION_STRING
  );
}

/**
 * Ищет пользователя в Postgres для входа в админку.
 * @returns {{ mode: 'ok', user: object } | { mode: 'not_found' } | { mode: 'error' } | { mode: 'no_config' }}
 */
export async function findAdminUserInPostgres(normalizedEmail) {
  if (!hasPostgresEnv()) {
    return { mode: 'no_config' };
  }

  try {
    const { rows } = await pgQuery(
      `SELECT id, email, password_hash, "role" FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1`,
      [normalizedEmail]
    );
    if (!rows?.length) {
      return { mode: 'not_found' };
    }
    return { mode: 'ok', user: rows[0] };
  } catch (err) {
    console.error('[admin login] Postgres:', err?.message || err);
    return { mode: 'error' };
  }
}
