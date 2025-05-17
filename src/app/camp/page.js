import styles from "./camp.module.css";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";

export default function Camp() {
    return (
        <div className={styles.component}>
            <div className={styles.container}>
                {/* <Header /> */}
                <div className={styles.home} style={{ backgroundImage: "url('/img/shows/shows_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>Летний</h1>
                        <h1 className={styles.header}>Лагеь</h1>
                    </div>
                </div>
                <PaymentCardCommon type={'camp'} />
            </div>
            <div className={styles.content}>
            </div>
        </div>
    );
}
