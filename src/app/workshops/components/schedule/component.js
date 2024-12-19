'use client'
import { useState, useEffect } from "react";
import styles from "./workshopsSchedule.module.css";
import Image from "next/image";
import ScheduleCard from "../scheduleCard/component";
import { useWorkshopsStore } from "@/store/workshopsStore"; // Импортируем ваш Zustand store
import PaymentForm from "@/components/PaymentForm/PaymentForm";
import { usePaymentModalStore } from "@/store/PaymentModalStore";

export default function WorkshopsSchedule({ type }) {
    const { schedule, updateSchedule, currentWorkshopItem } = useWorkshopsStore();
    const { isPaymentFormModalOpen } = usePaymentModalStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [plusIndex, setPlusIndex] = useState(3);

    const handleNext = () => {
        console.log(schedule.length)
        if (currentIndex < schedule.length - 3) {
            setCurrentIndex((prev) => prev + 3);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 3);
        }
    };

    const handleMore = () => {
        setCurrentIndex(1);
        setPlusIndex((prev) => prev + 3);

    };

    const [error, setError] = useState(null);
    useEffect(() => {
        console.log('Useeffect happened')
        const fetchData = async () => {
            try {
                const response = await fetch('/api/get-workshop-schedule');
                const data = await response.json();

                if (response.ok) {
                    updateSchedule(data);
                } else {
                    console.log('RESPONSE ERROR');
                    setError(data.error);
                }
            } catch (error) {
                setError('Ошибка при загрузке расписания мастер-классов');
            }
        };

        fetchData();
    }, [updateSchedule]);

    const slicedSchedule = schedule.slice(currentIndex, currentIndex + 3)

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши мастер классы
            </h2>
            <div className={styles.arrows_container}>
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
            <div className={styles.cards_container} id="workshop_schedule">
                {schedule.slice(currentIndex, currentIndex + plusIndex).map((e) => {
                    return <ScheduleCard data={e} key={e.ID} />
                })}
            </div>
            <div className={styles.more} onClick={handleMore}>Еще...</div>

            {isPaymentFormModalOpen && currentWorkshopItem && (
                <PaymentForm type={'mk'} data={currentWorkshopItem} />)}
        </div>
    );
}
