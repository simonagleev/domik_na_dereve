import { create } from 'zustand';

/**
 * API / Postgres могут отдать snake_case или (редко) старые PascalCase ключи.
 */
function normalizeEventTypeRow(t) {
  if (!t || typeof t !== 'object') return null;
  const tech_name = t.tech_name ?? t.TechName;
  const name = t.name ?? t.Name;
  const id = t.id ?? t.ID;
  if (tech_name == null || String(tech_name).trim() === '') return null;
  return {
    id,
    created_at: t.created_at ?? t.CreatedAt,
    name: name ?? '',
    is_active: t.is_active ?? t.IsActive,
    sort_order: t.sort_order ?? t.Order,
    tech_name: String(tech_name).trim(),
  };
}

/**
 * Общий контекст страницы «Конструктор мероприятий»: вкладки (типы из API), активная вкладка.
 * Данные и модалки по вкладкам — в отдельных сторах (shows / workshops / …).
 */
export const useEventConstructorStore = create((set) => ({
  eventTypes: [],
  typesLoading: true,
  typesError: '',
  activeTech: null,

  setActiveTech: (value) => {
    if (!value) return;
    set({ activeTech: value });
  },

  loadEventTypes: async () => {
    set({ typesLoading: true, typesError: '' });
    try {
      const res = await fetch('/api/admin/event-types');
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || data?.message || `HTTP ${res.status}`;
        console.error('event-types error', data);
        set({ eventTypes: [], typesError: String(msg) });
        return;
      }

      const raw = Array.isArray(data) ? data : [];
      const eventTypes = raw.map(normalizeEventTypeRow).filter(Boolean);
      const fallback = eventTypes.length ? eventTypes[0].tech_name : null;
      set((prev) => ({
        eventTypes,
        activeTech: prev.activeTech ?? fallback,
      }));
    } catch (e) {
      console.error('event-types fetch', e);
      set({ eventTypes: [], typesError: e?.message || 'Ошибка сети' });
    } finally {
      set({ typesLoading: false });
    }
  },
}));
