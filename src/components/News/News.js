'use client'
import styles from "./News.module.css";
import Image from "next/image";
import { useState } from 'react';

const newsItems = [
    {
        img: '/img/princess.jpg',
        title: 'Рождается творчество:',
        text: 'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.',
    },
    {
        img: '/img/princess.jpg',
        title: 'Рождается творчество:',
        text: 'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.',
    },
    {
        img: '/img/princess.jpg',
        title: 'Рождается творчество:',
        text: 'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.',
    },
    {
        img: '/img/princess.jpg',
        title: 'Рождается творчество:',
        text: 'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.',
    },
    {
        img: '/img/princess.jpg',
        title: 'Рождается творчество:',
        text: 'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.',
    },
];

const addSpanToLastWord = (title) => {
    const words = title.split(" ");

    if (words.length > 1) {
        // Добавляем <span> перед и после последнего слова
        words[words.length - 1] = `<span style="color: rgba(108, 181, 106, 1)">${words[words.length - 1]}</span>`;
      }

    return words.join(" ");
};

const NewsCard = ({ img, title, text }) => {
    const formattedTitle = addSpanToLastWord(title);

    return (
        <div className={styles.news_card_container}>
            <Image
                className={styles.news_card_img}
                src={img}
                alt="Новость"
                width={0} // Убираем фиксированную ширину
                height={0} // Убираем фиксированную высоту
                sizes="100vw"
            />
            <h3 className={styles.news_card_title} dangerouslySetInnerHTML={{ __html: formattedTitle }}/>
                
            <p className={styles.news_card_text}>
                {text}
            </p>
        </div>
    )
}

export default function News() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollAmount = 350; // Количество пикселей для прокрутки

    // Функции для прокрутки
    const handleNext = () => {
        setScrollPosition((prev) => prev + scrollAmount);
    };

    const handlePrev = () => {
        setScrollPosition((prev) => Math.max(prev - scrollAmount, 0)); // Не даем прокрутить влево за начало
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.news_title}>НОВОСТИ И АКЦИИ</h2>
            {/* <NewsCard img={"/img/princess.jpg"} title={'Рождается творчество:'} text={'дети обучаются актерскому мастерству, участвуют в спектаклях и развивают свои таланты в увлекательной и поддерживающей атмосфере.'} /> */}
            <div className={styles.news_feed_container}>
            <div className={styles.news_feed}>
                {newsItems.map((item, index) => (
                    <NewsCard key={index} img={item.img} title={item.title} text={item.text} />
                ))}
            </div>
            {/* <div className={styles.navigation_buttons}>
                <button className={styles.arrow_button} onClick={handlePrev}>◁</button>
                <button className={styles.arrow_button} onClick={handleNext}>▷</button>
            </div> */}
        </div>
        </div>
    );
}
