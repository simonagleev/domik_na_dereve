import { create } from 'zustand';

export const useShowsStore = create((set) => ({
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
    
    // data: [
    //     {
    //         ID: 1,
    //         name: 'Дары времени',
    //         imageURL: "/img/workshops/venok_bg.svg",
    //         description: "В волшебном мире остановилось время. Но у храброго гнома Бигли Бэгли есть чёткий план как восстановить ход времени. Он собирается найти всех 4 духов времен года. Но помогут ли они ему завести волшебные часы, и кто виновен в том, что время замерло?",
    //         date: '16 декабря',
    //         schedule: [
    //             "2024-21-12 12:00",
    //             "2024-21-12 15:00",
    //             "2024-21-12 18:00",
    //             "2024-22-12 11:00",
    //             "2024-22-12 13:00",
    //         ],
    //     },
    //     {
    //         ID: 2,
    //         imageURL: "/img/workshops/santa.svg",
    //         age: 5,
    //         date: '18 декабря',
    //         workshops: [
    //             {
    //                 name: "Новогодний рисунок Дедушки Мороза на холсте",
    //                 time: "17:00",
    //                 text: "Холст, гуашь",
    //                 details: "Длительность: 1 час",
    //             },
    //             {
    //                 name: "Новогодний рисунок снеговика на холсте",
    //                 time: "18:30",
    //                 text: "Холст, гуашь",
    //                 details: "Длительность: 1 час",
    //             },
    //         ],
    //     },
    //     {
    //         ID: 3,
    //         imageURL: "/img/workshops/venok_bg.svg",
    //         age: 15,
    //         date: '126 декабря',
    //         workshops: [
    //             {
    //                 name: "TEST",
    //                 time: "17:00",
    //                 text: "Создайте яркий новогодний венок из цветной бумаги своими руками!",
    //                 details: "Длительность: 1 час",
    //             },
    //             {
    //                 name: "TEST",
    //                 time: "18:30",
    //                 text: "Яркий новогодний венок из бумаги и гуаши своими руками!",
    //                 details: "Длительность: 1 час",
    //             },
    //         ],
    //     },
    // ],

    // pickedWorkshopTime: null,
    // pickedWorkshopName: null,

    // // Метод для обновления данных (опционально)
    // updateData: (newData) => set({ data: newData }),
    
    // // Метод для обновления выбранного времени
    // setPickedWorkshopTime: (time) => set({ pickedWorkshopTime: time }),

    // // Метод для обновления выбранного названия мастер-класса
    // setPickedWorkshopName: (name) => set({ pickedWorkshopName: name }),

    // // Метод для сброса выбора мастер-класса
    // resetPickedWorkshop: () => set({ pickedWorkshopTime: null, pickedWorkshopName: null }),
}));
