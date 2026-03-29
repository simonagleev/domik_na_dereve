import { create } from 'zustand';

export const usePaymentModalStore = create((set) => ({
  isPaymentFormModalOpen: false,
  count: 1,
  formData: {
    childName: '',
    clientName: '',
    phone: '',
    email: '',
    amount: 0,
    type: null,
    itemID: null,
    date: '',
    info: '',
  },

  openPaymentFormModal: () => set({ isPaymentFormModalOpen: true }),
  closePaymentFormModal: () => set({ isPaymentFormModalOpen: false }),

  updateCount: (updateFn) => set((state) => ({ count: updateFn(state.count) })),

  updateFormData: (field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    })),

  resetCount: () => set({ count: 1 }),
  resetFormData: () =>
    set({
      formData: {
        childName: '',
        clientName: '',
        phone: '',
        email: '',
        amount: 0,
        type: null,
        itemID: null,
        date: '',
        info: '',
      },
    }),
}));
