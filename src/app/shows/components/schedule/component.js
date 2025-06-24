'use client'
import { useState, useEffect } from "react";
import styles from "./showssSchedule.module.css";
import ScheduleCard from "../scheduleCard/component";
import { useShowsStore } from "@/store/showsStore";
import Loader from "@/components/Loader/Loader";

export default function ShowssSchedule({ type }) {
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const { updateSchedules, showSchedules } = useShowsStore();
    
    // Получаем данные из SUPABASE DB
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/showsSchedule');
                const data = await response.json();

                if (response.ok) {
                    console.log('OK 888')
                    console.log(data)
                    updateSchedules(data); // Обновляем состояние расписания
                } else {
                    console.log('RESPONSE ERROR');
                    setError(data.error);
                }
                setLoading(false)
            } catch (error) {
                setError('Ошибка при загрузке данных');
                setLoading(false)
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
                {!loading ? showSchedules.map((e) => {
                    return e.schedules.length > 0 ? <ScheduleCard data={e} key={e.id} /> : null;  // Передаем данные шоу, включая расписания
                }) : <Loader/>}
            </div>
        </div>
    );
}
