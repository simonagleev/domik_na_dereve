import { create } from 'zustand';

export const useFeedbackRequestFormStore = create((set) => ({
    isFeedbackRequestFormOpen: false,
    formData: {
        name: '',
        phone: '',
        type: '',
        childName: '',
        childAge: '',
        eventDate: '',
    },
    isSuccess: false,
    //modal
    openFeedbackRequestForm: (type) => set({ isFeedbackRequestFormOpen: true, type: type }),
    closeFeedbackRequestForm: () => set({ isFeedbackRequestFormOpen: false }),
    updateFormData: (field, value) =>
        set((state) => ({
            formData: {
                ...state.formData, // сохраняем текущие значения
                [field]: value, // обновляем только указанное поле
            },
        })),
    resetFormData: () => set({
        formData: {
            name: '',
            phone: '',
            type: '',
            childName: '',
            childAge: '',
            eventDate: '',
        }
    }),
    setIsSuccess: (value) => set({ isSuccess: value }),

}));
