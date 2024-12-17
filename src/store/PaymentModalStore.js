import { create } from 'zustand';

export const usePaymentModalStore = create((set) => ({
    isPaymentFormModalOpen: false,
    count: 1,

    // name: null,
    // phone: null,
    // email: null,
    // date: '',
    // time: '',
    // title: '',

    // amount: 0,
    // type: null,
    // itemID: null,
    // dateTime: '',
    // info: '',

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


    //moal
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
            name: '',
            phone: '',
            email: '',
            amount: 0,
            type: null,
            itemID: null,
            date: '',
            info: '',
        }
    }),

    // //base
    // setName: (data) => set({ name: data }),
    // setPhone: (data) => set({ phone: data }),
    // setEmail: (data) => set({ email: data }),
    // setDate: (data) => set({ date: data }),
    // setTime: (data) => set({ time: data }),
    // setTitle: (data) => set({ title: data }),

    // //needed for db
    // setAmount: (data) => set({ amount: data }),
    // setType: (data) => set({ type: data }),
    // setItemID: (data) => set({ itemID: data }),
    // setDateTime: (data) => set({ dateTime: data }),
    // setInfo: (data) => set({ info: data }),
}));
