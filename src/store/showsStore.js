import { create } from 'zustand';

/**
 * showSchedules — массив с сервера /api/showsSchedule: { id, name, age, image_*, schedules[] }.
 */
export const useShowsStore = create((set, get) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  schedules: [],
  showSchedules: [],

  updateSchedules: (groupedShows) => {
    const list = Array.isArray(groupedShows) ? groupedShows : [];
    set({
      showSchedules: list,
      schedules: list.flatMap((g) =>
        (g.schedules || []).map((s) => ({ ...s, showName: g.name }))
      ),
    });
  },

  updateShowSchedules: (newShowSchedules) => set({ showSchedules: newShowSchedules }),

  pickedShow: null,
  updatePickedShow: (item) => set({ pickedShow: item }),

  idToSend: null,
  updateIdToSend: (id) => set({ idToSend: id }),

  ticketCount: null,
  updateTicketCount: (count) => set({ ticketCount: count }),

  currentShowItem: {
    id: null,
    showID: null,
    price: 0,
    remainingCount: 0,
    date: '',
    comments: '',
  },
  updateCurrentShowItem: (data) => set({ currentShowItem: data }),
}));
