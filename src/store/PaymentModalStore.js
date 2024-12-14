import { create } from 'zustand';

export const usePaymentModalStore = create((set) => ({
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
}));
