import { create } from 'zustand';

export const useWorkshopsStore = create((set) => ({
    data: [
        {
            ID: 1,
            imageURL: "/img/workshops/venok_bg.svg",
            age: 5,
            date: '16 декабря',
            workshops: [
                {
                    name: "Новогодний венок",
                    time: "17:00",
                    text: "Создайте яркий новогодний венок из цветной бумаги своими руками!",
                    details: "Длительность: 1 час",
                },
                {
                    name: "Новогодний венок из ёлочек",
                    time: "18:30",
                    text: "Яркий новогодний венок из бумаги и гуаши своими руками!",
                    details: "Длительность: 1 час",
                },
            ],
        },
        {
            ID: 2,
            imageURL: "/img/workshops/santa.svg",
            age: 5,
            date: '18 декабря',
            workshops: [
                {
                    name: "Новогодний рисунок Дедушки Мороза на холсте",
                    time: "17:00",
                    text: "Холст, гуашь",
                    details: "Длительность: 1 час",
                },
                {
                    name: "Новогодний рисунок снеговика на холсте",
                    time: "18:30",
                    text: "Холст, гуашь",
                    details: "Длительность: 1 час",
                },
            ],
        },
        {
            ID: 3,
            imageURL: "/img/workshops/venok_bg.svg",
            age: 15,
            date: '126 декабря',
            workshops: [
                {
                    name: "TEST",
                    time: "17:00",
                    text: "Создайте яркий новогодний венок из цветной бумаги своими руками!",
                    details: "Длительность: 1 час",
                },
                {
                    name: "TEST",
                    time: "18:30",
                    text: "Яркий новогодний венок из бумаги и гуаши своими руками!",
                    details: "Длительность: 1 час",
                },
            ],
        },
    ],

    pickedWorkshopTime: null,
    pickedWorkshopName: null,

    // Метод для обновления данных (опционально)
    updateData: (newData) => set({ data: newData }),
    
    // Метод для обновления выбранного времени
    setPickedWorkshopTime: (time) => set({ pickedWorkshopTime: time }),

    // Метод для обновления выбранного названия мастер-класса
    setPickedWorkshopName: (name) => set({ pickedWorkshopName: name }),

    // Метод для сброса выбора мастер-класса
    resetPickedWorkshop: () => set({ pickedWorkshopTime: null, pickedWorkshopName: null }),
}));
