'use client'

import styles from "./card.module.css";
import Image from "next/image";
import { useState } from "react";

export default function Cw_card({ data, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`${styles.card} ${expanded ? styles.expanded : ""}`} key={index}>
            <div className={styles.workshop_items_container}>
                <div className={styles.workshop_item}>
                    <div className={styles.card_image_container}>
                        <Image
                            className={styles.card_image}
                            src={`${data.imageUrl}`}
                            alt="мк фото"
                            width={300}
                            height={350}
                        />
                    </div>
                    <h2 className={styles.card_title}>
                        {data.name}
                    </h2>

                    {data.description && (
                        <p
                            className={`${styles.card_text} ${!expanded ? styles.truncated : ""}`}
                            onClick={() => setExpanded(!expanded)}
                        >
                            {data.description}
                        </p>
                    )}
                    {data.age ? <p className={styles.card_text}>
                        Возраст: <b>{data.age}</b>
                    </p> : null}
                    <p className={styles.price}>
                        Цена : {data.price} рублей
                    </p>
                </div>
            </div>
        </div>
    );
}
