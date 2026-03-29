import { create } from 'zustand';
import { notifications } from '@mantine/notifications';

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

const emptySlotForm = () => ({
  entityId: '',
  date: '',
  time: '',
  remaining_count: 14,
  is_active: true,
  comments: '',
});

export const useAdminScheduleStore = create((set, get) => ({
  showsOptions: [],
  showsMaxTicketsById: {},
  showsOptionsLoading: false,
  workshopsOptions: [],
  workshopsMaxTicketsById: {},
  workshopsOptionsLoading: false,

  showsScheduleRows: [],
  showsScheduleLoading: false,

  workshopsScheduleRows: [],
  workshopsScheduleLoading: false,

  /** Форма модалки «Новый слот» */
  scheduleSlotForm: emptySlotForm(),
  scheduleSlotSaving: false,

  resetScheduleSlotForm: () => set({ scheduleSlotForm: emptySlotForm() }),

  setScheduleSlotForm: (patch) =>
    set((s) => ({
      scheduleSlotForm: { ...s.scheduleSlotForm, ...patch },
    })),

  /** Безопасное значение из onChange инпутов (Mantine / React может отдать нестандартное событие) */
  scheduleSlotInputValue: (raw) => {
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    return raw.currentTarget?.value ?? raw.target?.value ?? '';
  },

  scheduleSlotSwitchChecked: (raw) => {
    if (typeof raw === 'boolean') return raw;
    return raw?.currentTarget?.checked ?? false;
  },

  setScheduleSlotEntityId: (eventType, entityId) => {
    const id = entityId || '';
    const { showsMaxTicketsById, workshopsMaxTicketsById } = get();
    const map = eventType === 'shows' ? showsMaxTicketsById : workshopsMaxTicketsById;
    const nextRemaining =
      id && map[id] != null ? Number(map[id]) : 14;
    set((s) => ({
      scheduleSlotForm: {
        ...s.scheduleSlotForm,
        entityId: id,
        remaining_count: nextRemaining,
      },
    }));
  },

  buildScheduleSlotStartDatetime: () => {
    const { date, time } = get().scheduleSlotForm;
    const d = String(date || '').trim();
    const t = String(time || '').trim();
    if (!d || !t) return null;
    if (/^\d{2}:\d{2}$/.test(t)) {
      return `${d} ${t}:00`;
    }
    return `${d} ${t}`;
  },

  scheduleSlotEditSaving: false,

  updateScheduleSlot: async (eventType, slotId, fields) => {
    const id = Number(slotId);
    const start = String(fields?.start_datetime || '').trim();
    if (!id || !start) {
      notifications.show({
        color: 'red',
        title: 'Не заполнено',
        message: 'Укажите дату и время начала.',
      });
      return { ok: false };
    }

    const remaining_count = Number(fields?.remaining_count) || 0;
    const is_active = Boolean(fields?.is_active);
    const comments =
      fields?.comments != null && String(fields.comments).trim() !== ''
        ? String(fields.comments).trim()
        : null;

    set({ scheduleSlotEditSaving: true });
    try {
      const params = [start, remaining_count, is_active, comments, id];

      if (eventType === 'shows') {
        await rawExec(
          'UPDATE shows_schedule SET start_datetime = $1, remaining_count = $2, is_active = $3, "comments" = $4 WHERE id = $5',
          params
        );
      } else if (eventType === 'workshops') {
        await rawExec(
          'UPDATE workshop_schedule SET start_datetime = $1, remaining_count = $2, is_active = $3, "comments" = $4 WHERE id = $5',
          params
        );
      } else {
        return { ok: false };
      }

      notifications.show({ color: 'green', message: 'Сохранено' });
      return { ok: true };
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: err?.message || 'Не удалось сохранить',
      });
      return { ok: false };
    } finally {
      set({ scheduleSlotEditSaving: false });
    }
  },

  saveScheduleSlot: async (eventType) => {
    const start = get().buildScheduleSlotStartDatetime();
    const { entityId, remaining_count, is_active, comments } = get().scheduleSlotForm;
    const idStr = String(entityId || '').trim();

    if (!start || !idStr) {
      notifications.show({
        color: 'red',
        title: 'Не заполнено',
        message: 'Выберите мероприятие и укажите дату и время начала.',
      });
      return { ok: false };
    }

    set({ scheduleSlotSaving: true });
    try {
      const params = [
        start,
        Number(idStr),
        Number(remaining_count) || 0,
        Boolean(is_active),
        String(comments || '').trim() || null,
      ];

      if (eventType === 'shows') {
        await rawExec(
          'INSERT INTO shows_schedule (start_datetime, show_id, remaining_count, is_active, "comments") VALUES ($1, $2, $3, $4, $5)',
          params
        );
      } else if (eventType === 'workshops') {
        await rawExec(
          'INSERT INTO workshop_schedule (start_datetime, workshop_id, remaining_count, is_active, "comments") VALUES ($1, $2, $3, $4, $5)',
          params
        );
      } else {
        return { ok: false };
      }

      notifications.show({ color: 'green', message: 'Добавлено' });
      return { ok: true };
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: err?.message || 'Не удалось сохранить',
      });
      return { ok: false };
    } finally {
      set({ scheduleSlotSaving: false });
    }
  },

  loadShowsOptions: async () => {
    set({ showsOptionsLoading: true });
    try {
      const rows = await rawSelect(
        'SELECT id, "name", max_tickets FROM shows ORDER BY "name" ASC NULLS LAST'
      );
      const showsMaxTicketsById = {};
      for (const r of rows) {
        const id = String(r.id);
        const mt = r.max_tickets;
        showsMaxTicketsById[id] = mt != null && mt !== '' ? Number(mt) : 14;
      }
      set({
        showsOptions: rows.map((r) => ({
          value: String(r.id),
          label: r.name != null ? String(r.name) : `#${r.id}`,
        })),
        showsMaxTicketsById,
      });
    } catch (e) {
      console.error('loadShowsOptions', e);
      set({ showsOptions: [], showsMaxTicketsById: {} });
    } finally {
      set({ showsOptionsLoading: false });
    }
  },

  loadWorkshopsOptions: async () => {
    set({ workshopsOptionsLoading: true });
    try {
      const rows = await rawSelect(
        'SELECT id, "name", max_tickets FROM workshops ORDER BY "name" ASC NULLS LAST'
      );
      const workshopsMaxTicketsById = {};
      for (const r of rows) {
        const id = String(r.id);
        const mt = r.max_tickets;
        workshopsMaxTicketsById[id] = mt != null && mt !== '' ? Number(mt) : 14;
      }
      set({
        workshopsOptions: rows.map((r) => ({
          value: String(r.id),
          label: r.name != null ? String(r.name) : `#${r.id}`,
        })),
        workshopsMaxTicketsById,
      });
    } catch (e) {
      console.error('loadWorkshopsOptions', e);
      set({ workshopsOptions: [], workshopsMaxTicketsById: {} });
    } finally {
      set({ workshopsOptionsLoading: false });
    }
  },

  /**
   * Удаление слота расписания (после подтверждения на клиенте).
   */
  deleteScheduleSlot: async (eventType, slotId) => {
    const id = Number(slotId);
    if (!id || Number.isNaN(id)) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Некорректный идентификатор слота.',
      });
      return false;
    }

    try {
      if (eventType === 'shows') {
        await rawExec('DELETE FROM shows_schedule WHERE id = $1', [id]);
      } else if (eventType === 'workshops') {
        await rawExec('DELETE FROM workshop_schedule WHERE id = $1', [id]);
      } else {
        return false;
      }

      notifications.show({
        color: 'green',
        title: 'Удалено',
        message: 'Слот расписания удалён.',
      });

      if (eventType === 'shows') {
        await get().loadShowsSchedule();
      } else {
        await get().loadWorkshopsSchedule();
      }
      return true;
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: err?.message || 'Не удалось удалить слот',
      });
      return false;
    }
  },

  loadShowsSchedule: async () => {
    set({ showsScheduleLoading: true });
    try {
      const rows = await rawSelect(`
        SELECT ss.id, to_char(ss.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime, ss.show_id, ss.remaining_count, ss.is_active, ss.comments,
               s.name AS show_name
        FROM shows_schedule ss
        LEFT JOIN shows s ON s.id = ss.show_id
        ORDER BY ss.start_datetime DESC NULLS LAST, ss.id DESC
      `);
      set({ showsScheduleRows: rows });
    } catch (e) {
      console.error('loadShowsSchedule', e);
      set({ showsScheduleRows: [] });
    } finally {
      set({ showsScheduleLoading: false });
    }
  },

  loadWorkshopsSchedule: async () => {
    set({ workshopsScheduleLoading: true });
    try {
      const rows = await rawSelect(`
        SELECT ws.id, to_char(ws.start_datetime, 'YYYY-MM-DD"T"HH24:MI:SS') AS start_datetime, ws.workshop_id, ws.remaining_count, ws.is_active, ws.comments,
               w.name AS workshop_name
        FROM workshop_schedule ws
        LEFT JOIN workshops w ON w.id = ws.workshop_id
        ORDER BY ws.start_datetime DESC NULLS LAST, ws.id DESC
      `);
      set({ workshopsScheduleRows: rows });
    } catch (e) {
      console.error('loadWorkshopsSchedule', e);
      set({ workshopsScheduleRows: [] });
    } finally {
      set({ workshopsScheduleLoading: false });
    }
  },
}));
