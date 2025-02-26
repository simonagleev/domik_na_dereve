'use client'
import ModalDescription from "./ModalDescription/ModalDescription";
import styles from "./aboutSection.module.css";
import { useDescriptionModatStore } from "@/store/descriptionModatStore";


export default function AboutSection() {
    const { isOpen, openDescriptionModal } = useDescriptionModatStore();
    
    return (
        <div className={styles.about_container}>
            {isOpen && <ModalDescription />}

            <div className={styles.about_card}>
                <div className={styles.about_number} style={{ color: 'rgba(108, 181, 106, 1)' }}>01</div>
                <h2 className={styles.about_card_header}>
                    {/* Рождается <span style={{ color: 'rgba(108, 181, 106, 1)' }}>творчество:</span> */}
                    <span style={{ color: 'rgba(108, 181, 106, 1)' }}>Театр</span> «Домик на дереве» -
                </h2>
                <p className={styles.about_card_text}>
                    {/* дети обучаются актерскому мастерству, участвуют в <br />
            спектаклях и развивают свои таланты в увлекательной<br />
            и поддерживающей атмосфере. */}
                    это иммерсивный детский театр.
                </p>
                <div className={styles.more_btn_container}>
                    <button
                        className={styles.more_btn}
                        style={{ backgroundColor: 'rgba(108, 181, 106, 1)' }}
                        onClick={() => openDescriptionModal(1)}>
                        Подробнее...
                    </button>
                </div>

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
    );
}
