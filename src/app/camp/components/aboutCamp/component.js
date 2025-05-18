'use client'

import BasicButton from "@/components/button/BasicButton";
import styles from "./aboutCamp.module.css";
import Image from "next/image";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";


export default function AboutCamp() {
    const { openFeedbackRequestForm } = useFeedbackRequestFormStore();

    const greenBtnHandler = () => {
        console.log('greenClick')
        openFeedbackRequestForm('camp')
    }
    return (
        <div className={styles.container}>
            <div className={styles.about_text_block}>
                <h3 className={styles.about_header}>Лето — время приключений, новых друзей и творчества</h3>
                <h4 className={styles.about_header_small}>Приглашаем детей от 7 до 12 лет </h4>
                <p className={styles.text}>Что ждёт участников:</p>
                <ul className={styles.list}>
                    <li className={styles.list_item}>Погружение в атмосферу театра и сценической игры</li>
                    <li className={styles.list_item}>Работа над настоящим спектаклем</li>
                    <li className={styles.list_item}>Встречи с профессиональными актёрами</li>
                    <li className={styles.list_item}>Ежедневные творческие мастер-классы, рисование и поделки</li>
                    <li className={styles.list_item}>Весёлые квесты, викторины и подвижные игры</li>
                    <li className={styles.list_item}>Утренняя гимнастика для заряда бодрости</li>
                    <li className={styles.list_item}>Интересные истории из жизни великих людей</li>
                </ul>
                <div className={styles.highlight_container}>
                    <p className={styles.text}>2 сезона:</p>
                </div>
                <div className={styles.seasons_container}>
                    <div style={{ textAlign: 'center' }}>
                        <p className={styles.text}>2 июня — 13 июня </p>
                        <span className={styles.span}>(набор завершен)</span>
                    </div>
                    <p className={styles.text}>16 июня — 27 июня</p>
                </div>
                <div className={styles.highlight_container}>
                    <p className={styles.text}>Место:</p>
                </div>
                <div className={styles.place_container}>
                    <p className={styles.text}>г. Иркутск, ул. Лермонтова, 275/9</p>
                </div>
                <p className={styles.text_small}>Количество мест ограничено!</p>
                <p className={styles.text_small} style={{ marginBottom: '10px' }}>Подарите ребёнку лето, наполненное творчеством, сценой и магией театра.</p>
                <BasicButton
                    text='Записаться'
                    background='var(--main-green)'
                    fontSizeMin='1rem'
                    fontSizeMax='1.5rem'
                    handler={greenBtnHandler}
                />
            </div>
            <div className={styles.about_image_block}>
                <Image
                    className={styles.about_image}
                    src="/img/camp/camp_about.svg"
                    alt="Лагерь"
                    width={550}
                    height={750}
                />
            </div>

            <img
                src="img/bg_figure_flower.png"
                alt="figure 1"
                className={styles.bg_figure}
            />
            <img
                src="img/bg_figure_flower.png"
                alt="figure 2"
                className={styles.bg_figure}
            />
        </div>
    );
}
