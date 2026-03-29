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
        cw_name: '',
    },
    isSuccess: false,
    /** Тост после отправки заявки (дни рождения / творческие мастерские); живёт после закрытия модалки */
    feedbackToast: null,
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
            cw_name: '',
        }
    }),
    setIsSuccess: (value) => set({ isSuccess: value }),

    showFeedbackToast: (payload) => set({ feedbackToast: payload }),
    clearFeedbackToast: () => set({ feedbackToast: null }),
}));
