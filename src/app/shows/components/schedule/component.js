'use client'
import { useState, useEffect } from "react";
import styles from "./showssSchedule.module.css";
import Image from "next/image";
import ScheduleCard from "../scheduleCard/component";
import { useWorkshopsStore } from "@/store/workshopsStore"; // Zustand store

const shows = [{id: 1, name: 'Дары времени'}, {id: 2, name: 'Снегурочка'}];

export default function ShowssSchedule({ type }) {
    const data = useWorkshopsStore((state) => state.data);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [schedules, setSchedules] = useState([]); // Храним расписания
    const [error, setError] = useState(null);

    const handleNext = () => {
        if (currentIndex < data.length - 2) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    // Получаем данные из SUPABASE DB
    useEffect(() => {
        console.log('ЗАПРОС НАЧАЛСЯ');
        const fetchData = async () => {
            try {
                const response = await fetch('/api/showsSchedule');
                const data = await response.json();

                if (response.ok) {
                    console.log('RESPONSE OK');
                    console.log(data);
                    setSchedules(data); // Обновляем состояние расписания
                } else {
                    console.log('RESPONSE ERROR');
                    setError(data.error);
                }
            } catch (error) {
                setError('Ошибка при загрузке данных');
            }
        };

        fetchData();
    }, []);

    // Формируем новый массив с расписаниями для каждого шоу, только после получения данных
    const showsWithSchedules = shows.map(show => {
        const showSchedules = schedules.filter(schedule => schedule.ShowID === show.id);
        return { ...show, schedules: showSchedules };  // Добавляем найденные расписания к элементу show
    });

    console.log('showsWithSchedules');
    console.log(showsWithSchedules); // Логируем данные для отладки

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши спектакли
            </h2>
            {/* <div className={styles.arrows_container} id="workshop_schedule">
                <div className={styles.arrow} onClick={handlePrev}>
                    <Image
                        className={styles.arrows_img}
                        src="/img/arrow_left.svg"
                        alt="стрелка"
                        width={20}
                        height={10}
                    />
                </div>
                <div className={styles.arrow} onClick={handleNext}>
                    <Image
                        className={styles.arrows_img}
                        src="/img/arrow_right.svg"
                        alt="стрелка"
                        width={20}
                        height={10}
                    />
                </div>
            </div> */}

            <div className={styles.cards_container}>
                {/* Используем showsWithSchedules после загрузки расписания */}
                {showsWithSchedules.map((e) => {
                    return <ScheduleCard data={e} key={e.id} />;  // Передаем данные шоу, включая расписания
                })}
            </div>
        </div>
    );
}
