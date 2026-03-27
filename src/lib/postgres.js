import { Pool } from 'pg';

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

