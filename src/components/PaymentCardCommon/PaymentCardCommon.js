'use client'
import styles from "./PaymentCardCommon.module.css";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";

export default function PaymentCardCommon({ type }) {
    const { openFeedbackRequestForm } = useFeedbackRequestFormStore();

    let title = null
    let text = null
    let buttonText = null
    var action = null

    switch (type) {
        case 'shows':
            title = <h2 className={styles.card_header}>
                Погружение в <br />
                волшебный мир вместе <br />
                c <span className={styles.accent}>“Домиком на дереве”</span>
            </h2>
            buttonText = 'Купить билеты'
            break
        case 'workshops':
            title = <h2 className={styles.card_header}>
                Мастер-классы для <br />
                <span className={styles.accent}>юных талантов</span>
            </h2>
            text = ''
            // <p className={styles.card_text}>
            //     Проводим МК по актерскому искусству,<br />
            //     сценической речи, рукоделию и другим<br />
            //     направлениям для детей разного возраста
            // </p>
            buttonText = 'Перейти к списку МК'

            break
        case 'birthdays':
            title = <h2 className={styles.card_header}>
                Устройте волшебный<br />
                день рождения в<br />
                <span className={styles.accent}>“Домике на дереве”</span>
            </h2>
            buttonText = 'Узнать стоимость'
            action = () => { openFeedbackRequestForm('birthday') }
            break
        case 'creative_workshops':
            title = <h2 className={styles.card_header}>
                Начни творческий путь в<br />
                <span className={styles.accent}>“Домике на дереве”</span>
            </h2>
            buttonText = 'Записаться на занятие'
            action = () => { openFeedbackRequestForm('creative_workshops') }
            break
        case 'camp':
            title = <h2 className={styles.card_header}>
                Летний Лагерь с<br />
                <span className={styles.accent}> “Домиком на дереве”</span>
            </h2>
            buttonText = 'Отправить заявку'
            action = () => { openFeedbackRequestForm('camp') }
            break
        default:
            title = <h2 className={styles.card_header}>
                Нет информации<br />
                <span className={styles.accent}>попробуйте еще раз</span>
            </h2>
    }

    return (
        <div className={styles.card_container}>
            <div className={styles.card_inner}>
                {title}
                {text}
                <button
                    type="button"
                    className={styles.buy_btn}
                    onClick={() => {
                        const target = document.getElementById(`${type === 'shows' ? "shows_schedule" : type === 'workshops' ? "workshop_schedule" : null}`);
                        if (target) {
                            target.scrollIntoView({ behavior: "smooth" });
                        } else if (action) {
                            action();
                        }
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
