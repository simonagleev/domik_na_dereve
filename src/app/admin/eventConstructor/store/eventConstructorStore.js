import { create } from 'zustand';

/**
 * Общий контекст страницы «Конструктор мероприятий»: вкладки (типы из API), активная вкладка.
 * Данные и модалки по вкладкам — в отдельных сторах (shows / workshops / …).
 */
export const useEventConstructorStore = create((set) => ({
  eventTypes: [],
  typesLoading: true,
  activeTech: null,

  setActiveTech: (value) => {
    if (!value) return;
    set({ activeTech: value });
  },

  loadEventTypes: async () => {
    set({ typesLoading: true });
    try {
      const res = await fetch('/api/admin/event-types');
      const data = await res.json();
      if (!res.ok) {
        console.error('event-types error', data);
        set({ eventTypes: [] });
        return;
      }

      const eventTypes = Array.isArray(data) ? data : [];
      const fallback = eventTypes.length ? eventTypes[0].TechName : null;
      set((prev) => ({
        eventTypes,
        activeTech: prev.activeTech ?? fallback,
      }));
    } catch (e) {
      console.error('event-types fetch', e);
      set({ eventTypes: [] });
    } finally {
      set({ typesLoading: false });
    }
  },
}));
