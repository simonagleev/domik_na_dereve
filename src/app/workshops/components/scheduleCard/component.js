'use client'

import styles from "./scheduleCard.module.css";
import Image from "next/image";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import PaymentButton from "@/components/PaymentButton/PaymentButton";
import PaymentForm from "@/components/PaymentForm/PaymentForm";
import { useWorkshopsStore } from "@/store/workshopsStore";

export default function ScheduleCard({ data }) {
    const isModalOpen = usePaymentModalStore((state) => state.isModalOpen);
    const openModal = usePaymentModalStore((state) => state.openModal);
    const { setPickedWorkshopTime,
        setPickedWorkshopName,
        pickedWorkshopTime,
        pickedWorkshopName } = useWorkshopsStore();

    const handlePickWorkshop = (time, workshop) => {
        setPickedWorkshopTime(time);
        setPickedWorkshopName(workshop);
        openModal()
    }

    return (
        <div className={styles.card} key={data.ID}>
            <div className={styles.card_image_container}>
                <Image
                    className={styles.card_image}
                    src={data.imageURL}
                    alt="венок"
                    width={0}
                    height={0}
                />
                <p className={styles.age}>с {data.age} лет</p>

            </div>
            <h2 className={styles.card_date}>
                {data.date}
            </h2>
            <div className={styles.workshop_items_container}>
                {data.workshops.map((e, index) => {
                    return (
                        <div className={styles.workshop_item} key={index}>
                            <h2 className={styles.card_title}>
                                {e.name + " " + e.time}
                            </h2>
                            <p className={styles.card_tezt}>
                                {e.text}
                            </p>
                            <p className={styles.card_tezt}>
                                {e.details}
                            </p>
                            <PaymentButton type={'mk'} handler={() => handlePickWorkshop(e.time, e.name)} />
                        </div>
                    )
                })}
            </div>
            {isModalOpen && <PaymentForm type={'mk'} date={data.date} time={pickedWorkshopTime} title={pickedWorkshopName} />}
        </div>
    );
}
