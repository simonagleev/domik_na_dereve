import { create } from 'zustand';

export const useWorkshopsEventConstructorStore = create((set, get) => ({
  workshopsRows: [],
  workshopsLoading: false,

  modalOpen: false,
  modalMode: 'create',
  editingRow: null,

  openCreateModal: () => set({ modalMode: 'create', editingRow: null, modalOpen: true }),
  openEditModal: (row) => set({ modalMode: 'edit', editingRow: row ?? null, modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),

  loadWorkshops: async () => {
    set({ workshopsLoading: true });
    try {
      const res = await fetch('/api/admin/postgres/raw-sql-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM workshops ORDER BY id DESC',
          params: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('workshops list', json);
        set({ workshopsRows: [] });
        return;
      }
      const rows = Array.isArray(json?.data) ? json.data : [];
      set({ workshopsRows: rows });
    } catch (e) {
      console.error('workshops fetch', e);
      set({ workshopsRows: [] });
    } finally {
      set({ workshopsLoading: false });
    }
  },

  refresh: async () => {
    await get().loadWorkshops();
  },
}));
