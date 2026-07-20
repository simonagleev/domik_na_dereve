'use client'

import BasicButton from "@/components/button/BasicButton";
import styles from "./aboutAfterSchoolCare.module.css";
import Image from "next/image";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";

const benefits = [
    {
        number: 1,
        title: 'Забота как дома:',
        text: 'наши профессиональные педагоги окружают вниманием каждого ребенка (группа до 15 детей)',
        color: 'rgba(108, 181, 106, 1)',
    },
    {
        number: 2,
        title: 'Развитие без стресса:',
        text: 'мастерим, рисуем, обсуждаем книги, играем в командные игры.',
        color: 'rgba(255, 213, 205, 1)',
    },
    {
        number: 3,
        title: 'Здоровое меню:',
        text: 'правильное и вкусное питание, которое дает энергию.',
        color: 'rgba(187, 215, 229, 1)',
    },
    {
        number: 4,
        title: 'Английский в удовольствие:',
        text: 'учим язык через игры и общение',
        color: 'rgba(108, 181, 106, 1)',
    },
];

export default function AboutAfterSchoolCare() {
    const { openFeedbackRequestForm } = useFeedbackRequestFormStore();

    const handleDetailsClick = () => {
        openFeedbackRequestForm('after_school_care');
    };

    return (
        <div className={styles.container}>
            <div className={styles.why_container}>
                <div className={styles.why_left}>
                    <h3 className={styles.why_heading}>
                        Почему родители <span className={styles.why_heading_accent}>выбирают «Домик на дереве»</span>
                    </h3>
                    <p className={styles.why_text}>
                        Мы создали пространство, где уроки - это не скучная обязанность, а творчество - способ самовыражения.
                    </p>
                    <Image
                        className={styles.why_img}
                        src="/img/day_care/day_care_1.jpg"
                        alt="Дети на продленке"
                        width={600}
                        height={450}
                        sizes="(max-width: 900px) 100vw, 50vw"
                    />
                </div>
                <div className={styles.why_right}>
                    {benefits.map((item) => (
                        <div key={item.number} className={styles.why_card}>
                            <div className={styles.why_card_number} style={{ color: item.color }}>
                                {item.number}
                            </div>
                            <div className={styles.why_card_text}>
                                <strong>{item.title}</strong> {item.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.button_container}>
                <BasicButton
                    text="Узнать подробности"
                    background="var(--main-green)"
                    fontSizeMin="1rem"
                    fontSizeMax="1.5rem"
                    handler={handleDetailsClick}
                />
            </div>
        </div>
    );
}
