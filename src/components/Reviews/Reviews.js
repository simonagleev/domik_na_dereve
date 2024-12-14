'use client'
import styles from "./Reviews.module.css";
import Image from "next/image";
import { useState } from 'react';

const testReviewsData = [
    {
        img: "/img/alexandra.png",
        name: 'Александра',
        text_1: 'Как родитель, я хотел бы поделиться своим опытом о нашем детском театральном кружке. Я искренне ценю индивидуальный подход к каждому ребёнку, который здесь практикуется. Каждый из них получает возможность раскрыть свои таланты, а внимание педагога обеспечивает комфортную и поддерживающую атмосферу для творческого самовыражения.',
        text_2: 'Особое внимание стоит уделить участию детей в спектаклях, конкурсах и фестивалях, которые не только развивают творческие способности, но и закладывают основы уверенности в себе.'
    },
    {
        img: "/img/sofa.png",
        name: 'София',
        text_1: 'Эти мероприятия становятся не просто событиями, а настоящими праздниками, где каждый ребёнок ощущает свою значимость и может продемонстрировать достигнутые результаты.',
        text_2: 'Также радует дружеская атмосфера, царящая в коллективе. Здесь каждый талант ценится, и дети учатся поддерживать друг друга, что формирует командный дух. Уверенность, навыки публичных выступлений и работа в команде становятся важными не только для театральной деятельности, но и для жизни в целом. Я очень благодарна всем организаторам и педагогам за их труд и вклад в развитие детей.'
    },
    {
        img: "/img/alexandra.png",
        name: 'Александра',
        text_1: 'Тест',
        text_2: 'ХЕХЕ'
    },
]

const ReviewCard = ({ img, name, text_1, text_2 }) => {
    return (
        <div className={styles.review_card}>
            <Image
                className={styles.reviews_arrow_img}
                src={img}
                alt="Фото"
                width={54}
                height={54}
            />
            <h3 className={styles.reviews_arrow_name}>
                {name}
            </h3>
            <p className={styles.reviews_card_text}>
                {text_1}
            </p>
            <p className={styles.reviews_card_text}>
                {text_2}
            </p>
        </div>
    )
}

export default function Reviews() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < testReviewsData.length - 2) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.reviews_top}>
                <h3 className={styles.reviews_heading}>
                    Как о нас отзываются<br /> <span style={{ color: 'rgba(119, 171, 199, 1)' }}>родители малышей?</span>
                </h3>
                <div className={styles.reviews_arrows_container}>
                    <div className={styles.reviews_arrow} onClick={handlePrev}>
                        <Image
                            className={styles.reviews_arrow_img}
                            src="/img/arrow_left.svg"
                            alt="стрелка"
                            width={20}
                            height={10}
                        />
                    </div>
                    <div className={styles.reviews_arrow} onClick={handleNext}>
                        <Image
                            className={styles.reviews_arrow_img}
                            src="/img/arrow_right.svg"
                            alt="стрелка"
                            width={20}
                            height={10}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.reviews_cards_container}>
                {testReviewsData.slice(currentIndex, currentIndex + 2).map((review, index) => (
                    <ReviewCard
                        key={index}
                        img={review.img}
                        name={review.name}
                        text_1={review.text_1}
                        text_2={review.text_2}
                    />
                ))}
            </div>

        </div>
    );
}
