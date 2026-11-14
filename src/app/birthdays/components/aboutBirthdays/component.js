'use client'

import BasicButton from "@/components/button/BasicButton";
import styles from "./aboutBirthdays.module.css";
import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/Modal/Modal";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";

const stations = [{
    icon: '🎨 ',
    title: 'Станция «Творить» -',
    text: 'мастер-класс, где каждый сможет почувствовать себя художником.',
    color: 'var(--pale-green-bg)'
},
{
    icon: '💭 ',
    title: 'Станция «Мечтать» -',
    text: ' квест с сюрпризами и загадками, который увлечёт даже самых непоседливых.',
    color: 'var(--pale-red-bg)'
},
{
    icon: '✨ ',
    title: 'Станция «Волшебничать» -',
    text: 'мини-спектакль с интерактивом, где дети становятся частью сказки.',
    color: 'var(--pale-blue-bg)'
},]

const includedItems = [
    {
        position: 1,
        text: 'мастер-класс',
        color: 'var(--pale-green-bg)'
    },
    {
        position: 2,
        text: 'квест по поиску подарка имениннику',
        color: 'var(--pale-red-bg)'
    },
    {
        position: 3,
        text: 'спектакль',
        color: 'var(--pale-blue-bg)'
    },
    {
        position: 4,
        text: 'банкетная зона',
        color: 'var(--pale-green-bg)'
    },
    {
        position: 5,
        text: 'воздушный шар каждому маленькому гостю',
        color: 'var(--pale-red-bg)'
    },
]

export default function AboutBirthdays() {
    const [open, setOpen] = useState(false)
    const { openFeedbackRequestForm } = useFeedbackRequestFormStore();

    const blueBtnHandler = () => {
        console.log('blueClick')
        setOpen(true)
    }
    const greenBtnHandler = () => {
        console.log('greenClick')
        openFeedbackRequestForm('birthdays')
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.about_header}>Праздник, о котором будут вспоминать весь год!</h3>
            <p className={styles.about_text}>
                Наша программа - это 2,5–3 часа волшебства, радости и настоящих приключений!
            </p>
            <p className={styles.about_text}>
                Детей ждут три тематические станции, каждая из которых раскроет их фантазию и подарит незабываемые впечатления:
            </p>
            <div className={styles.stations_container}>
                {stations.map((e, index) => {
                    return (<div key={index} style={{ backgroundColor: e.color }} className={styles.stations_item}>
                        <h3 className={styles.stations_header}>{e.icon} {e.title}</h3>
                        <p className={styles.stations_text}>{e.text}</p>
                    </div>)
                })}
            </div>
            <div className={styles.bottom_container}>
                <div className={styles.bottom_text_container}>
                    <p className={styles.block_text}>В стоимость входит</p>
                    <div className={styles.included_items_container}>
                        {includedItems.sort((a, b) => a.position < b.position).map((e, index) => {
                            return (<div className={styles.included_item} style={{ backgroundColor: e.color }} key={index}>
                                {`\u2022`}{e.text}
                            </div>)
                        })}
                    </div>
                    <div className={styles.block_container}>
                        <p className={styles.block_text}>Максимум - 16 детей.</p>
                        <p className={styles.block_text}>Мы - камерное пространство, поэтому внимание и уют гарантированы каждому.</p>
                    </div>
                    <div className={styles.buttons_container}>
                        <BasicButton
                            text='Как проходят дни рождения в Домике'
                            background='var(--main-blue)'
                            fontSizeMin='1rem'
                            fontSizeMax='1.5rem'
                            handler={blueBtnHandler}
                        />
                        <BasicButton
                            text='Забронировать'
                            background='var(--main-green)'
                            fontSizeMin='1rem'
                            fontSizeMax='1.5rem'
                            handler={greenBtnHandler}
                        />
                    </div>
                </div>
                <div className={styles.bottom_image_container}>
                    <Image
                        className={styles.image}
                        src="/img/birthdays/about_bd.svg"
                        alt="Девочка с тортом"
                        width={45}
                        height={45}
                    />
                </div>
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

            <Modal isOpen={open} onClose={() => setOpen(false)}>
                <div className={styles.video_container}>
                    <video className={styles.video} controls preload="auto" muted autoPlay loop playsInline>
                        <source src="/video/video_domik_dr.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </Modal>

        </div>
    );
}
