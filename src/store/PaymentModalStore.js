import { create } from 'zustand';

export const usePaymentModalStore = create((set) => ({
    isPaymentFormModalOpen: false,
    count: 1,

    formData: {
        name: '',
        phone: '',
        email: '',
        amount: 0,
        type: null,
        itemID: null,
        date: '',
        info: '',
    },


    //modal
    openPaymentFormModal: () => set({ isPaymentFormModalOpen: true }),
    closePaymentFormModal: () => set({ isPaymentFormModalOpen: false }),

    // updateCount: (data) => set({ count: Number(data) }),
    updateCount: (updateFn) => set((state) => ({ count: updateFn(state.count) })),

    updateFormData: (field, value) =>
        set((state) => ({
            formData: {
                ...state.formData, // сохраняем текущие значения
                [field]: value, // обновляем только указанное поле
            },
        })),

    resetCount: () => set({ count: 1 }),
    resetFormData: () => set({
        formData: {
            name: null,
            phone: null,
            email: null,
            amount: 0,
            type: null,
            itemID: null,
            date: '',
            info: '',
        }
    }),

}));
