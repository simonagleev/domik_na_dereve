'use client'
import Image from "next/image";
import styles from "./MainHomeCard.module.css";
import Link from "next/link";

export default function MainHomeCard({header, paragraph, buttonText, colorBg, link, id, key}) {

    return (
        <div className={styles.card_container}>
            <div className={styles.card_social_container}>
                <a href="https://t.me/DomiknaDereve38" target="_blank" rel="noopener noreferrer">
                    <Image
                        className={styles.image}
                        src="/img/telegram_icon.svg"
                        alt="Телеграм"
                        width={45}
                        height={45}
                    />
                </a>
                <a href="https://www.instagram.com/domiknadereve38/profilecard" target="_blank" rel="noopener noreferrer">
                    <Image
                        className={styles.image}
                        src="/img/instagramm_icon.svg"
                        alt=""
                        width={45}
                        height={45}
                    />
                </a>
            </div>
            <h2 className={styles.card_header}>
                {header}
            </h2>
            <p className={styles.card_text}>
                {paragraph}
            </p>

            <div className={styles.wrapper} >
                <Link className={styles.button} style={{ background: colorBg }} href={`/${link}`}>{buttonText}</Link>
            </div>
            <svg style={{ visibility: "hidden", position: "absolute" }} width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
