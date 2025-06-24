'use client'

import styles from "./scheduleCard.module.css";
import Image from "next/image";
import PaymentButton from "@/components/PaymentButton/PaymentButton";
import { useShowsStore } from "@/store/showsStore";
import ScheduleModal from "../scheduleModal/component";

export default function ScheduleCard({ data }) {
    const { isModalOpen, openModal, updatePickedShow } = useShowsStore();

    const handeOpenModal = () => {
        updatePickedShow(data ? data : 'no data')
        openModal()
    }

    let commentsArray = null
    if (data.schedules[0].Comments) {
        commentsArray = data.schedules[0].Comments.split(/(?<=[.!?])\s+/)
    }

    return (
        <div className={styles.card}>
            <div className={styles.card_info}>
                <div className={styles.card_info_text}>
                    <h2 className={`${styles.card_name} ${(data.name === "Снегурочка" || data.name === "Малыш, потерявший фантазию") ? styles.card_name_long : null}`}>
                        {data.name}
                    </h2>
                    <p className={styles.card_description}>
                        {data.schedules[0] ? data.schedules[0].Description : 'Описание'}
                    </p>
                    <p className={styles.card_description}>
                        Приходите, пожалуйста, за 15 минут до начала спектакля, чтобы своим опозданием не нарушить волшебную атмосферу.
                    </p>
                    {/* {data.schedules[0].Comments ? commentsArray.map(e => 
                        <p className={styles.card_comment}>
                            {e}
                        </p> )
                        : null} */}
                    {data.schedules[0].Comments ? 
                    <div style={{marginBottom: '10px'}}>
                        <p className={styles.card_description} style={{fontWeight: 700}}>
                            {commentsArray[0]}
                        </p>
                        <p className={styles.card_description}>
                            {commentsArray[1]}
                        </p>
                    </div>
                        : null}
                    <p className={styles.price}>
                        Цена билета: {data.schedules[0] ? data.schedules[0].Price : 'Цена'} рублей
                    </p>
                </div>

                <PaymentButton type={'main'} handler={handeOpenModal} />
            </div>
            <div className={styles.card_image_container}>
                <Image
                    className={styles.card_image}
                    src={`/img/shows/${data.id === 1 ? 'dari_vremeni.svg' : 
                        data.id === 3 ? 'malchik.png' : 
                        data.id === 4 ? 'karton_desire.jpg' : 
                        'snegurochka.jpg'}`}
                    alt="show picture"
                    width={700}
                    height={600}
                />
            </div>
            {isModalOpen && <ScheduleModal key={data.id} />}
        </div>
    );
}
