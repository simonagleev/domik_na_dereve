
'use client'
import MainHomeCard from "../MainHomeCard/MainHomeCard";
import styles from "./MainHomeSlider.module.css";
import { getSeason } from "@/utils/season";
import { useState, useEffect } from "react";

//Получаем сезон
const month = new Date().getMonth()
const season = getSeason(month)
const gradientMap = {
    spring: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(163, 184, 55, 1))",
    summer: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(185, 218, 52, 1))",
    autumn: "linear-gradient(to right, rgba(100, 59, 39, 1), rgba(204, 140, 58, 1))",
    winter: "linear-gradient(to right, #7E94B3, #907D93)",
};

const items = [{
    id: 1,
    name: 'Спектакли',
    header: 'Творчество и эмоции в каждом моменте!',
    text: 'Театральные постановки, увлекательные мастер-классы и яркие праздники ждут вашего ребенка.',
    buttonText: 'Спектакли',
    link: 'shows'
},
{
    id: 2,
    name: 'Мастер классы',
    header: 'Творчество и эмоции в каждом моменте!',
    text: 'Театральные постановки, увлекательные мастер-классы и яркие праздники ждут вашего ребенка.',
    buttonText: 'Мастер-классы',
    link: 'workshops'
}, {
    id: 3,
    name: 'Дни рождения',
    header: 'День Рождения в театре',
    text: 'уникальные программы для проведения днейрождения с театральными постановками имастер-классами',
    buttonText: 'День Рождения',
    link: 'birthdays'
}, {
    id: 4,
    name: 'Творческие мастерские',
    header: 'Творческие мастерские',
    text: 'индивидуальный подход, уютное пространство ипрофессиональные педагоги, вдохновляющиедетей раскрывать свои способности',
    buttonText: 'Записаться на занятие',
    link: 'creative_workshops'
},]

export default function MainHomeSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Функция переключения карточки
    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    // Автопрокрутка каждые 10 секунд
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval); // Очистка интервала при размонтировании
    }, []);

    return (
        <div className={styles.container}>
            {items.map((e, index) => (
                <div
                    key={e.id}
                    className={styles.cardWrapper}
                    style={{ display: index === activeIndex ? "block" : "none" }}
                    onClick={() => nextSlide()} // Смена по клику
                >
                    <MainHomeCard
                        header={e.header}
                        paragraph={e.text}
                        buttonText={e.buttonText}
                        colorBg={gradientMap[season]}
                        link={e.link}
                    />
                </div>
            ))}
        </div>
    );
}
