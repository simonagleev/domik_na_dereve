'use client'

import styles from "./scheduleCard.module.css";
import Image from "next/image";
import PaymentButton from "@/components/PaymentButton/PaymentButton";
import { useShowsStore } from "@/store/showsStore";
import ScheduleModal from "../scheduleModal/component";
import { useState, useEffect } from "react";

export default function ScheduleCard({ data }) {
    // Модалка для оплаты ()
    const isModalOpen = useShowsStore((state) => state.isModalOpen);
    const openModal = useShowsStore((state) => state.openModal);

    return (
        <div className={styles.card} key={data.id}>
            <div className={styles.card_info}>
                <div>
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

                <PaymentButton type={'main'} handler={openModal}/>
            </div>
            <Image
                className={styles.card_image}
                src={"/img/shows/dari_vremeni.svg"}
                alt="dari"
                width={0}
                height={0}
            />

            {isModalOpen && <ScheduleModal schedule={data.schedules ? data.schedules : []}  />}
        </div>
    );
}
