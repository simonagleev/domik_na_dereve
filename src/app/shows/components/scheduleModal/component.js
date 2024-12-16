'use client'
import styles from "./scheduleModal.module.css";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useShowsStore } from "@/store/showsStore";
import ItemCard from "./ItemCard";

export default function ScheduleModal({id }) {
    const pickedShow = useShowsStore((state) => state.pickedShow);

    console.log('SHECDULE MODAL')
    console.log(pickedShow)
    const closeModal = useShowsStore((state) => state.closeModal);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeModal();
        }
    };

    //

    // const [date, setDate] = useState('');
    // const [time, setTime] = useState('');

    // useEffect(() => {
    //     if (modalData) {
    //         const dateTimeString = modalData;

    //         // Преобразуем строку в объект Date
    //         const dateObj = new Date(dateTimeString);

    //         // Получаем дату в формате YYYY-MM-DD
    //         const formattedDate = dateObj.toLocaleDateString('en-GB'); // или 'ru-RU' для формата день.месяц.год
    //         setDate(formattedDate);

    //         // Получаем время в формате HH:MM
    //         const formattedTime = dateObj.toLocaleTimeString('en-GB', {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //         });
    //         setTime(formattedTime);
    //     }
    // }, [modalData]);

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside} key={id}>
            <div className={styles.form_container}>
                {/* Кнопка крестик */}
                <button className={styles.close_button} onClick={closeModal} aria-label="Закрыть форму">
                    &times;
                </button>
                {pickedShow.schedules.map((e, index) => {
                    return (
                        < ItemCard data={e} index={index}/>)
                })}

            </div>
        </div>
    );
}
