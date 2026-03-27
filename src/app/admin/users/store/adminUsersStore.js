import { create } from 'zustand';

const USERS_LIST_SQL =
  'SELECT id, created_at, "name", phone, "role", email, sex, age, password_clue FROM users ORDER BY id DESC';

/** Postgres / API может отдать ключи в разном регистре */
export function rowField(row, ...keys) {
  if (row == null) return undefined;
  for (const k of keys) {
    if (k in row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return undefined;
}

export function formatUserCreatedAt(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

export const useAdminUsersStore = create((set) => ({
  rows: [],
  loading: true,
  error: '',

  loadUsers: async () => {
    set({ loading: true, error: '' });
    try {
      const res = await fetch('/api/admin/postgres/raw-sql-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: USERS_LIST_SQL,
          params: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        set({ error: json.error || 'Ошибка загрузки', rows: [] });
        return;
      }
      set({ rows: Array.isArray(json?.data) ? json.data : [] });
    } catch (e) {
      set({ error: e?.message || 'Ошибка сети', rows: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
