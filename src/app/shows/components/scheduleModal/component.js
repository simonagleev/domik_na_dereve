'use client'
import styles from "./scheduleModal.module.css";
import Image from "next/image";
import { useState } from 'react';
import { useShowsStore } from "@/store/showsStore";

export default function ScheduleModal({ schedule }) {
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
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            <div className={styles.payment_form}>
                {/* Кнопка крестик */}
                <div className={styles.close_button_container}>
                    <button className={styles.close_button} onClick={closeModal} aria-label="Закрыть форму">
                        &times;
                    </button>
                    test
                </div>
       
            </div>
        </div>
    );
}
