'use client'

import styles from "./scheduleCard.module.css";
import Image from "next/image";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import PaymentButton from "@/components/PaymentButton/PaymentButton";
import { useWorkshopsStore } from "@/store/workshopsStore";

export default function ScheduleCard({ data }) {
    const isPaymentFormModalOpen = usePaymentModalStore((state) => state.isPaymentFormModalOpen);
    const openPaymentFormModal = usePaymentModalStore((state) => state.openPaymentFormModal);
    const { setPickedWorkshopTime,
        updateCurrentWorkshopItem,
    } = useWorkshopsStore();

    const handleClick = () => {
        updateCurrentWorkshopItem(data)
        !isPaymentFormModalOpen ? openPaymentFormModal() : console.log('PAYMENT FORM ALREADY OPENED')
    }

    return (
        <div className={styles.card} key={data.ID}>
            <div className={styles.workshop_items_container}>
                <h2 className={styles.card_date}>
                    {new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long' }).format(new Date(data.StartDateTime)) + ' в ' + data.StartDateTime.split('T')[1].slice(0, 5)}
                </h2>
                <div className={styles.workshop_item}>
                    <div className={styles.card_image_container}>
                        <Image
                            className={styles.card_image}
                            src={`/img/workshops/${data.ImageName}`}
                            alt="мк фото"
                            width={200}
                            height={300}
                        />
                    </div>
                    <h2 className={styles.card_title}>
                        {data.Name}
                    </h2>
                    <p className={styles.card_text}>
                        {data.Description ? data.Description : null}
                    </p>
                    <p className={styles.card_text}>
                        Длительность: {data.Duration} {data.Duration > 1 ? 'часа' : 'час'}
                    </p>
                    <p className={styles.price}>
                        Цена билета: {data.Price} рублей
                    </p>
                    <p className={styles.card_text}>
                        {/* Мест осталось: <b>{data.RemainingCount}</b> */}
                    </p>
                    <PaymentButton type={'mk'} handler={handleClick} />
                </div>
            </div>
        </div>
    );
}
