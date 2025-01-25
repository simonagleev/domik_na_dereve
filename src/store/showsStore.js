import { create } from 'zustand';

export const useShowsStore = create((set, get) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  schedules: [], // Список всех расписаний
  showSchedules: [], // Список расписаний, сгруппированных по шоу

  // Обновление общего массива расписаний
  updateSchedules: (newSchedules) => {
    set({ schedules: newSchedules });
    const shows = [{ id: 1, name: 'Дары времени' }, { id: 2, name: 'Снегурочка' }, { id: 3, name: 'Малыш, потерявший фантазию' },];
    const updatedShowSchedules = shows.map((show) => {
      const showSchedules = newSchedules.filter((schedule) => schedule.ShowID === show.id);
      return { ...show, schedules: showSchedules };
    });
    set({ showSchedules: updatedShowSchedules });
  },
  // Явное обновление showSchedules, если нужно вручную
  updateShowSchedules: (newShowSchedules) => set({ showSchedules: newShowSchedules }),


  pickedShow: null,
  updatePickedShow: (item) => { set({ pickedShow: item }) }, // Тут шоу из моего массива, не из бд, у него будет массив расписания, где будут уже из бБД записи

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
    comments: ''
  },  // А это уже запись из БД отдельная
  updateCurrentShowItem: (data) => set({ currentShowItem: data })
}));
