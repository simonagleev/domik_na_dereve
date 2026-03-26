import { create } from 'zustand';

function normalizeShowRow(r) {
  return {
    ID: r.id,
    CreatedAt: r.created_at,
    Name: r.name,
    Price: r.price,
    MaxTikets: r.max_tickets,
    Description: r.description,
    Comments: r.comments,
    Age: r.age,
    Duration: r.duration,
    ImageName: r.image_name,
    ImagePath: r.image_path,
    PreviewImagePath: r.preview_image_path,
    PeoplePerTicket: r.people_per_ticket,
  };
}

export const useAdminEventConstructorStore = create((set, get) => ({
  eventTypes: [],
  typesLoading: true,
  activeTech: null,

  showsRows: [],
  showsLoading: false,

  modalOpen: false,
  modalMode: 'create',
  editingRow: null,

  setActiveTech: (value) => {
    if (!value) return;
    set({ activeTech: value });
  },

  openCreateModal: () => set({ modalMode: 'create', editingRow: null, modalOpen: true }),
  openEditModal: (row) => set({ modalMode: 'edit', editingRow: row ?? null, modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),

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

  loadShows: async () => {
    set({ showsLoading: true });
    try {
      const res = await fetch('/api/admin/postgres/raw-sql-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM shows ORDER BY id DESC',
          params: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('shows list', json);
        set({ showsRows: [] });
        return;
      }
      const rows = Array.isArray(json?.data) ? json.data : [];
      set({ showsRows: rows.map(normalizeShowRow) });
    } catch (e) {
      console.error('shows fetch', e);
      set({ showsRows: [] });
    } finally {
      set({ showsLoading: false });
    }
  },

  refreshCurrentTab: async () => {
    if (get().activeTech === 'shows') {
      await get().loadShows();
    }
  },
}));

