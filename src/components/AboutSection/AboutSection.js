'use client'
import ModalDescription from "./ModalDescription/ModalDescription";
import styles from "./aboutSection.module.css";
import { useDescriptionModatStore } from "@/store/descriptionModatStore";
import { useEffect, useRef, useState } from "react";

export default function AboutSection() {
    // const { isOpen, openDescriptionModal } = useDescriptionModatStore();
    const aboutContainerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const target = aboutContainerRef.current; // Локальная переменная

        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target); // Используем локальную переменную
        };
    }, []);

    return (
        <>
            <h2 className={styles.content_header}>
                Домик на дереве — <br /><span className={styles.content_header_span}>это место, где</span>
            </h2>
            <div
                className={`${styles.about_container} ${isVisible ? styles.visible : ""}`}
                ref={aboutContainerRef}
            >
                <div className={styles.about_card}>
                    <div className={styles.about_number} style={{ color: 'rgba(108, 181, 106, 1)' }}>01</div>
                    <h2 className={styles.about_card_header}>
                        Рождается <span style={{ color: 'rgba(108, 181, 106, 1)' }}>творчество:</span>
                    </h2>
                    <p className={styles.about_card_text}>
                        дети обучаются актерскому мастерству, участвуют в <br />
                        спектаклях и развивают свои таланты в увлекательной<br />
                        и поддерживающей атмосфере.
                    </p>
                </div>

                <div className={styles.about_card}>
                    <div className={styles.about_number} style={{ color: 'rgba(187, 215, 229, 1)' }}>02</div>
                    <h2 className={styles.about_card_header}>
                        Каждый чувствует себя <span style={{ color: 'rgba(187, 215, 229, 1)' }}>особенным:</span>
                    </h2>
                    <p className={styles.about_card_text}>
                        индивидуальный подход, уютное пространство и <br />
                        профессиональные педагоги, вдохновляющие<br />
                        детей раскрывать свои способности.
                    </p>
                    <img
                        src="img/bg_figure_round_kids.png"
                        alt="figure kids"
                        className={styles.bg_figure}
                    />
                </div>

                <div className={styles.about_card}>
                    <div className={styles.about_number} style={{ color: 'rgba(255, 213, 205, 1)' }}>03</div>
                    <h2 className={styles.about_card_header}>
                        <span style={{ color: 'rgba(255, 213, 205, 1)' }}>Создаются</span> незабываемые праздники:
                    </h2>
                    <p className={styles.about_card_text}>
                        уникальные программы для проведения дней<br />
                        рождения с театральными постановками и<br />
                        мастер-классами.
                    </p>
                    <img
                        src="img/bg_figure_envelope.png"
                        alt="envelope"
                        className={`${styles.bg_figure} ${styles.bg_figure_2}`}
                    />
                </div>

                <div className={styles.about_card}>
                    <div className={styles.about_number} style={{ color: 'rgba(108, 181, 106, 1))' }}>04</div>
                    <h2 className={styles.about_card_header}>
                        Открываются новые <span style={{ color: 'rgba(108, 181, 106, 1)' }}>возможности:</span>
                    </h2>
                    <p className={styles.about_card_text}>
                        мастер-классы по актерскому искусству,<br />
                        сценической речи, рукоделию и другим<br />
                        направлениям для детей разного возраста.
                    </p>
                </div>

            </div>
        </>
    );
}
