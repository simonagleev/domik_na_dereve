'use client'
import styles from "./PaymentCardCommon.module.css";

export default function PaymentCardCommon({ type }) {
    let title = null
    let text = null
    let buttonText = null

    switch (type) {
        case 'shows':
            title = <h2 className={styles.card_header}>
                Погружение в <br />
                волшебный мир вместе <br />
                c <span style={{ color: 'rgba(124, 152, 120, 1)' }}>“Домиком на дереве”</span>
            </h2>
            buttonText = 'Купить билеты'
            break
        case 'mk':
            console.log('CASE')
            title = <h2 className={styles.card_header}>
                Мастер-классы для <br />
                <span style={{ color: 'rgba(124, 152, 120, 1)' }}>юных талантов</span>
            </h2>
            text = <p className={styles.card_text}>
                Проводим МК по актерскому искусству,<br />
                сценической речи, рукоделию и другим<br />
                направлениям для детей разного возраста
            </p>
            buttonText = 'Перейти к списку МК'

            break
        case 'birthdays':
            title = <h2 className={styles.card_header}>
                Устройте волшебный<br />
                день рождения в<br />
                <span style={{ color: 'rgba(124, 152, 120, 1)' }}>“Домике на дереве”</span>
            </h2>
            buttonText = 'Узнать стоимость'

            break
        default:
            title = <h2 className={styles.card_header}>
                Нет информации<br />
                <span style={{ color: 'rgba(124, 152, 120, 1)' }}>попробуйте еще раз</span>
            </h2>
    }

    return (
        <div className={styles.card_container} >
            {title}
            {text}
            <button
                className={styles.buy_btn}
                onClick={() => {
                    const target = document.getElementById(`${type === 'main' ? "shows_schedule" : type === 'mk'? "workshop_schedule" : "birthdays" }`);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                    }
                }}
            >
                {buttonText}
            </button>
        </div>
    );
}
