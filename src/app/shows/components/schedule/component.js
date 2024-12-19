'use client'
import { useState, useEffect } from "react";
import styles from "./showssSchedule.module.css";
import ScheduleCard from "../scheduleCard/component";
import { useShowsStore } from "@/store/showsStore";

export default function ShowssSchedule({ type }) {

    const [error, setError] = useState(null);
    const { updateSchedules, showSchedules } = useShowsStore();
    
    // Получаем данные из SUPABASE DB
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/showsSchedule');
                const data = await response.json();

                if (response.ok) {
                    updateSchedules(data); // Обновляем состояние расписания
                } else {
                    console.log('RESPONSE ERROR');
                    setError(data.error);
                }
            } catch (error) {
                setError('Ошибка при загрузке данных');
            }
        };

        fetchData();
    }, [updateSchedules]);

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши спектакли
            </h2>
            
            <div className={styles.cards_container} id="shows_schedule">
                {showSchedules.map((e) => {
                    return <ScheduleCard data={e} key={e.id} />;  // Передаем данные шоу, включая расписания
                })}
            </div>
        </div>
    );
}
