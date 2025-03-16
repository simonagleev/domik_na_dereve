'use client'
import styles from "./Reviews.module.css";
import Image from "next/image";
import { useState, useEffect } from 'react';

const testReviewsData = [
    {
        img: "/img/reviews/ekfah.jpg",
        name: 'Екатерина Вахотина',
        text_1: 'Хочу поблагодарить «Домик на дереве» ☺️ за мастер-класс по рисованию картины «мама и детки». Для моего ребенка с особенностями в развитии , это был первый подобный мастер-класс! На мой взгляд они с папой справились на отлично 🙂🙂🙂',
        text_2: 'Очень хочется посещать по возможности больше мероприятий детского центра. И так удобно, что живем в ЖК Сигма, прекрасный центр в шаговой доступности. 🥰🥰🥰👏👏👏'
    },
    {
        img: "/img/reviews/anvol.jpg",
        name: 'Анна Волынина',
        text_1: 'Мы в восторге от посещения детского центра! Очень понравился спектакль, восхитительная работа режиссёра и актёров! И дети, и взрослые получили массу эмоций!',
        text_2: 'Как здорово, что в нашем городе теперь есть такие прекрасные места для совместных посещений с детьми! Спасибо!'
    },
    {
        img: "/img/reviews/dmig.jpg",
        name: 'Дмитрий Игоривеч',
        text_1: 'Потрясающее место с потрясающими людьми!',
        text_2: 'Очень теплые сделанные с душой представления'
    },
    {
        img: "/img/reviews/no_photo.png",
        name: 'Ольга',
        text_1: 'Очень уютная атмосфера в студии, чувствовали себя здесь как дома. Побывали здесь уже дважды с ребенком за новогодние каникулы :) на мастер классе ( Рождественский ангел )и на спектакле .',
        text_2: 'Желаю процветания этому теплому пространству !'
    },
    {
        img: "/img/reviews/inla.jpg",
        name: 'Инна Лайднер',
        text_1: `Сегодня посетили это уютное место и поучаствовали в авторской сказке "Малыш, потерявший фантазию" . Сказка супер, и пока дети смотрят и играют, родителям есть о чем задуматься. Нежные обнимашки родителей с детишками в конце сказки - это вообще супер. Атмосфера Домика на дереве очень милая, спокойная.`,
        text_2: `После сказки нам предложили остаться на мастер-класс по рисованию семьи белых медведей. Малышам помогали мамы и папы... А мои внучки так расчувствовались, что хором стали исполнять песню про маму. Спасибо большое. Три часа пролетели как десять минут. И послевкусие осталось самое приятное.`
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
    const [moreNumber, setMoreNumber] = useState(2);

    const handleNext = () => {
        setMoreNumber(2)
        if (currentIndex < testReviewsData.length - 2) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        setMoreNumber(2)
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleMore = () => {
        setCurrentIndex(0);
        setMoreNumber((prev) => prev + 1)
    };

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 1100); // Останавливаем анимацию через 0.5 сек
        }, 3500);

        return () => clearInterval(interval);
    }, []);

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
                {testReviewsData.slice(currentIndex, currentIndex + moreNumber).map((review, index) => (
                    <ReviewCard
                        key={index}
                        img={review.img}
                        name={review.name}
                        text_1={review.text_1}
                        text_2={review.text_2}
                    />
                ))}
            </div>
            <div className={`${styles.more} ${animate ? styles.animate : ""}`} onClick={handleMore}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
        </div>
    );
}
