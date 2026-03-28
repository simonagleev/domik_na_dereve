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

export const useShowsEventConstructorStore = create((set, get) => ({
  showsRows: [],
  showsLoading: false,

  modalOpen: false,
  modalMode: 'create',
  editingRow: null,

  openCreateModal: () => set({ modalMode: 'create', editingRow: null, modalOpen: true }),
  openEditModal: (row) => set({ modalMode: 'edit', editingRow: row ?? null, modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),

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

  refresh: async () => {
    await get().loadShows();
  },
}));
