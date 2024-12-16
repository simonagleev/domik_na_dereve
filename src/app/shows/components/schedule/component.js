'use client'
import { useState, useEffect } from "react";
import styles from "./showssSchedule.module.css";
import Image from "next/image";
import ScheduleCard from "../scheduleCard/component";
import { useShowsStore } from "@/store/showsStore";

const shows = [{id: 1, name: 'Дары времени'}, {id: 2, name: 'Снегурочка'}];

export default function ShowssSchedule({ type }) {

    const [error, setError] = useState(null);
    const { schedules, updateSchedules, updateShowSchedules, showSchedules } = useShowsStore();
    
    // Получаем данные из SUPABASE DB
    useEffect(() => {
        console.log('ЗАПРОС НАЧАЛСЯ');
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

    console.log('schedules 1');
    console.log(schedules);   
    console.log('showSchedules 2'); 
    console.log(showSchedules); 

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши спектакли
            </h2>
            
            <div className={styles.cards_container}>
                {showSchedules.map((e) => {
                    return <ScheduleCard data={e} key={e.id} />;  // Передаем данные шоу, включая расписания
                })}
            </div>
        </div>
    );
}
