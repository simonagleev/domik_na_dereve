'use client'
import { useState } from "react";
import styles from "./workshopsSchedule.module.css";
import Image from "next/image";
import ScheduleCard from "../scheduleCard/component";
import { useWorkshopsStore } from "@/store/workshopsStore"; // Импортируем ваш Zustand store


export default function WorkshopsSchedule({ type }) {
    const data = useWorkshopsStore((state) => state.data);

    const [currentIndex, setCurrentIndex] = useState(0);

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

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши мастер классы
            </h2>
            <div className={styles.arrows_container} id="workshop_schedule">
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
            </div>
            <div className={styles.cards_container}>
                {data.slice(currentIndex, currentIndex + 2).map((e) => {
                    return <ScheduleCard data={e} key={e.ID}/>
                })}
            </div>
            
        </div>
    );
}
