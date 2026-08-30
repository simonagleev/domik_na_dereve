import { create } from 'zustand';
import { notifications } from '@mantine/notifications';

const ALLOWED_COLUMNS = new Set([
  'name',
  'price',
  'description',
  'age',
  'image_path',
  'schedule',
  'is_active',
  'sort_order',
]);

export function isCreativeWorkshopsTech(techName) {
  return techName === 'creativeWorkshops' || techName === 'creative_workshops';
}

async function rawSelect(sql, params = []) {
  const res = await fetch('/api/admin/postgres/raw-sql-select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка SELECT');
  return Array.isArray(json?.data) ? json.data : [];
}

async function rawExec(sql, params = []) {
  const res = await fetch('/api/admin/postgres/raw-sql-exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка SQL');
  return json;
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    id: row.id,
    name: row.name ?? '',
    price: Number(row.price ?? 0),
    description: row.description ?? '',
    age: row.age ?? null,
    image_path: row.image_path ?? '',
    schedule: Array.isArray(row.schedule) ? row.schedule.map((s) => String(s ?? '')) : [],
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active !== false,
  };
}

function sameId(a, b) {
  return String(a) === String(b);
}

export const useCreativeWorkshopsEventConstructorStore = create((set, get) => ({
  rows: [],
  loading: false,
  savingIds: {},

  setSaving: (id, value) => {
    set((s) => {
      const next = { ...s.savingIds };
      if (value) next[String(id)] = true;
      else delete next[String(id)];
      return { savingIds: next };
    });
  },

  load: async () => {
    set({ loading: true });
    try {
      const data = await rawSelect(
        'SELECT * FROM creative_workshops ORDER BY sort_order ASC, id ASC',
        []
      );
      set({ rows: data.map(normalizeRow).filter(Boolean) });
    } catch (e) {
      console.error('creative_workshops list', e);
      set({ rows: [] });
      notifications.show({
        color: 'red',
        title: 'Не удалось загрузить мастерские',
        message: e.message,
      });
    } finally {
      set({ loading: false });
    }
  },

  updateFields: async (id, patch) => {
    const keys = Object.keys(patch).filter((k) => ALLOWED_COLUMNS.has(k));
    if (!keys.length || id == null) return false;

    const prev = get().rows;
    const optimistic = prev.map((r) => (sameId(r.id, id) ? { ...r, ...patch } : r));
    set({ rows: optimistic });
    get().setSaving(id, true);

    try {
      const params = keys.map((k) => {
        if (k === 'price') return Number(patch[k]) || 0;
        if (k === 'age') {
          const v = patch[k];
          if (v == null || String(v).trim() === '') return null;
          return String(v).trim();
        }
        if (k === 'schedule') {
          return Array.isArray(patch[k]) ? patch[k].map((s) => String(s ?? '')) : [];
        }
        if (k === 'is_active') return Boolean(patch[k]);
        if (k === 'sort_order') return Number(patch[k]) || 0;
        return patch[k];
      });
      params.push(id);

      const setSql = keys
        .map((k, i) => (k === 'schedule' ? `${k} = $${i + 1}::text[]` : `${k} = $${i + 1}`))
        .join(', ');

      await rawExec(`UPDATE creative_workshops SET ${setSql} WHERE id = $${keys.length + 1}`, params);
      return true;
    } catch (e) {
      set({ rows: prev });
      notifications.show({
        color: 'red',
        title: 'Не удалось сохранить',
        message: e.message,
      });
      return false;
    } finally {
      get().setSaving(id, false);
    }
  },

  reorder: async (fromId, toId) => {
    if (sameId(fromId, toId)) return;
    const prev = get().rows;
    const from = prev.findIndex((r) => sameId(r.id, fromId));
    const to = prev.findIndex((r) => sameId(r.id, toId));
    if (from < 0 || to < 0) return;

    const next = [...prev];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const withOrder = next.map((r, i) => ({ ...r, sort_order: i + 1 }));
    set({ rows: withOrder });

    try {
      const ids = withOrder.map((r) => String(r.id));
      const orders = withOrder.map((_, i) => i + 1);
      await rawExec(
        `
        UPDATE creative_workshops AS cw
        SET sort_order = v.sort_order
        FROM unnest($1::bigint[], $2::integer[]) AS v(id, sort_order)
        WHERE cw.id = v.id
        `,
        [ids, orders]
      );
    } catch (e) {
      set({ rows: prev });
      notifications.show({
        color: 'red',
        title: 'Не удалось сохранить порядок',
        message: e.message,
      });
    }
  },

  create: async () => {
    const maxOrder = get().rows.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0);
    try {
      await rawExec(
        `
        INSERT INTO creative_workshops
          (name, price, description, age, image_path, schedule, sort_order, is_active)
        VALUES
          ($1, $2, $3, $4, $5, $6::text[], $7, false)
        `,
        ['Новая мастерская', 0, '', null, '', [], maxOrder + 1]
      );
      notifications.show({
        color: 'green',
        title: 'Карточка создана',
        message: 'Она скрыта с сайта. Заполните данные и включите «На сайте»',
      });
      await get().load();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Не удалось создать карточку',
        message: e.message,
      });
    }
  },
}));
