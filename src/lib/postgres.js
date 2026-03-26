import { Pool } from 'pg';

let pool;

function getConnectionConfig() {
  // Предпочтительный вариант: единый URL подключения
  const connectionString = process.env.POSTGRES_URL
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

