import { create } from 'zustand';

export const useShowsStore = create((set) => ({
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    schedules: [], // Список всех расписаний
    showSchedules: [], // Список расписаний, сгруппированных по шоу
    // Обновление общего массива расписаний
    updateSchedules: (newSchedules) => {
      set({ schedules: newSchedules });
      // После обновления расписаний, формируем showSchedules
      const shows = [{ id: 1, name: 'Дары времени' }, { id: 2, name: 'Снегурочка' }]; // или передавайте список извне
      const updatedShowSchedules = shows.map((show) => {
        const showSchedules = newSchedules.filter((schedule) => schedule.ShowID === show.id);
        return { ...show, schedules: showSchedules };
      });
      set({ showSchedules: updatedShowSchedules });
    },
    // Явное обновление showSchedules, если нужно вручную
    updateShowSchedules: (newShowSchedules) => set({ showSchedules: newShowSchedules }),


    pickedShow: null,
    updatePickedShow: (item) => set({ pickedShow: item }),

    idToSend: null,
    updateIdToSend: (id) => set({ idToSend: id }),
    
    ticketCount: null,
    updateTicketCount: (count) => set({ ticketCount: count }),
    
}));
