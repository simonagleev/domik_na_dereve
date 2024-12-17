'use client'

import styles from "./scheduleCard.module.css";
import Image from "next/image";
import PaymentButton from "@/components/PaymentButton/PaymentButton";
import { useShowsStore } from "@/store/showsStore";
import ScheduleModal from "../scheduleModal/component";

export default function ScheduleCard({ data }) {

    const {isModalOpen, openModal, updatePickedShow} = useShowsStore();

    const handeOpenModal = () => {
        updatePickedShow(data ? data : 'no data')
        openModal()
    }

    return (
        <div className={styles.card} key={data.id}>
            <div className={styles.card_info}>
                <div className={styles.card_info_text}>
                    <h2 className={styles.card_name}>
                        {data.name}
                    </h2>
                    <p className={styles.card_description}>
                        {data.schedules[0] ? data.schedules[0].Description : 'Описание'}
                    </p>
                    <p className={styles.card_description}>
                        Прихотиде, пожалуйста, за 20 минут до начала спектякля!
                    </p>
                    <p className={styles.price}>
                        Цена билета: {data.schedules[0] ? data.schedules[0].Price : 'Цена'} рублей
                    </p>
                </div>

                <PaymentButton type={'main'} handler={handeOpenModal}/>
            </div>
            <Image
                className={styles.card_image}
                src={"/img/shows/dari_vremeni.svg"}
                alt="dari"
                width={0}
                height={0}
            />

            {isModalOpen && <ScheduleModal key={data.id}/>}
        </div>
    );
}
