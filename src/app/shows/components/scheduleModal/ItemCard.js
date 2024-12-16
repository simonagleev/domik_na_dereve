'use client'
import styles from "./scheduleModal.module.css";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useShowsStore } from "@/store/showsStore";

export default function ItemCard({ data, index }) {
    const pickedShow = useShowsStore((state) => state.pickedShow);
    const closeModal = useShowsStore((state) => state.closeModal);
    const idToSend = useShowsStore((state) => state.idToSend)
    const updateIdToSend = useShowsStore((state) => state.updateIdToSend)
    const { ticketCount, updateTicketCount } = useShowsStore();

    const handleClick = () => {
        updateIdToSend(data.ID)
        closeModal()
    }


    const minCount = 1;
    const maxCount = 14;
    const increment = () => {
        if (ticketCount < maxCount) {
            updateTicketCount(ticketCount + 1);
        }
    };

    const decrement = () => {
        if (ticketCount > minCount) {
            updateTicketCount(ticketCount - 1);
        }
    };

    return (
        <div className={styles.item} key={index}>
            <div className={styles.item_line}>
                <h2 className={styles.date}>{data.StartDateTime.split('T')[0]}</h2>
            </div>
            <div className={styles.item_line}>
                <p className={styles.time}>{data.StartDateTime.split('T')[1].substring(0, 5)}</p>
            </div>
            <div className={styles.item_line}>
                <p className={styles.remainings}> Билетов осталось: {data.RemainingCount}</p>
            </div>
            {/* <div className={styles.item_line}>
                <div className={styles.counter}>
                    <button onClick={decrement} className={styles.button} disabled={ticketCount === minCount}>
                        -
                    </button>
                    <span className={styles.value}>{ticketCount}</span>
                    <button onClick={increment} className={styles.button} disabled={ticketCount === maxCount}>
                        +
                    </button>
                </div>
            </div> */}
            <button className={styles.buy_btn} onClick={handleClick}>
                Купить
            </button>
        </div>
    )
}
