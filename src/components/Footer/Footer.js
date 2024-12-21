import styles from "./Footer.module.css";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className={styles.footer} id="contacts">
            <div className={styles.footer_item_container}>
                <h3 className={styles.footer_heading}>
                    Навстречу<br /> <span style={{color: 'rgba(103, 159, 191, 1)'}}>волшебству и<br /> приключениям!</span>
                </h3>
                <Image
                    className={styles.footer_logo}
                    src="/img/footer_logo.svg"
                    alt="Домик на дереве лого"
                    width={266}
                    height={77}
                    priority
                />
            </div>
            <div className={styles.footer_item_container}>
                <div className={styles.footer_item}>
                    <h5 className={styles.footer_item_title}>Телефон для связи:</h5>
                    <p className={styles.footer_item_text}>
                        <a className={styles.footer_item_text} href="tel: +79149322882"> +7 (914) 932‑28‑82</a>
                    </p>
                </div>
                {/* <div className={styles.footer_item}>
                    <h5 className={styles.footer_item_title}>Электронная почта:</h5>
                    <p className={styles.footer_item_text}>info@domiknadereve-irkutsk.ru</p>
                </div> */}
                <div className={styles.footer_item}>
                    <h5 className={styles.footer_item_title}>Социальные сети:</h5>
                    <p className={styles.footer_item_text}>
                        <a href="https://t.me/DomiknaDereve38" target="_blank" rel="noopener noreferrer">TG: Домик на дереве</a>
                    </p>
                    <p className={styles.footer_item_text}>
                        <a href="https://www.instagram.com/domiknadereve38/profilecard" target="_blank" rel="noopener noreferrer">Instagramm</a>
                    </p>
                </div>
            </div>
            <div className={styles.footer_item_container}>
                <div className={styles.footer_item}>
                    <h5 className={styles.footer_item_title}>Адрес:</h5>
                    <p className={styles.footer_item_text}>Иркутск, Адрес: г. Иркутск, ул. Лермонтова 275/9
                    </p>
                </div>
                <div className={styles.footer_item}>
                    <h5 className={styles.footer_item_title}>Время работы:</h5>
                    <p className={styles.footer_item_text}>
                        Понедельник - Пятница: 10:00 - 20:00<br/>
                        Суббота: по предварительной записи<br/>
                        Воскресенье: по предварительной записи<br/>
                    </p>
                </div>
            </div>
        </footer>
    );
}
