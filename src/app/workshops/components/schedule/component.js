'use client'
import { useState, useEffect } from "react";
import styles from "./workshopsSchedule.module.css";
import Image from "next/image";
import ScheduleCard from "../scheduleCard/component";
import { useWorkshopsStore } from "@/store/workshopsStore"; // Импортируем ваш Zustand store
import PaymentForm from "@/components/PaymentForm/PaymentForm";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import Loader from "@/components/Loader/Loader";

export default function WorkshopsSchedule({ }) {
    const [loading, setLoading] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [plusIndex, setPlusIndex] = useState(3);
    const { schedule, updateSchedule, currentWorkshopItem } = useWorkshopsStore();
    const { isPaymentFormModalOpen } = usePaymentModalStore();

    const handleNext = () => {
        currentIndex < schedule.length - 3 ? setCurrentIndex((prev) => prev + 3) : null
    };

    const handlePrev = () => {
        currentIndex > 0 ? setCurrentIndex((prev) => prev - 3) : null
    };

    const handleMore = () => {
        setCurrentIndex(1);
        setPlusIndex((prev) => prev + 3);
    };

    const [error, setError] = useState(null);
    useEffect(() => {
        setLoading(true)
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
                setLoading(false)
            } catch (error) {
                setError('Ошибка при загрузке расписания мастер-классов');
                setLoading(false)
            }
        };

        fetchData();
    }, [updateSchedule]);

    return (
        <div className={styles.schedule} >
            <h2 className={styles.schedule_heading}>
                Наши мастер классы
            </h2>
            {schedule.length > 0 ? <div className={styles.arrows_container}>
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
            </div> : null}
            <div className={styles.cards_container} id="workshop_schedule">
                {!loading ? schedule.slice(currentIndex, currentIndex + plusIndex).map((e) => {
                    return <ScheduleCard data={e} key={e.ID} />
                }) : <Loader />}
            </div>
            {schedule.length > 0 ? <div className={styles.more} onClick={handleMore}>Еще...</div> : null}

            {isPaymentFormModalOpen && currentWorkshopItem && (
                <PaymentForm type={'mk'} data={currentWorkshopItem} />)}
        </div>
    );
}
