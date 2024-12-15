import ShowssSchedule from "./components/schedule/component";
import styles from "./shows.module.css";
// import Header from "@/components/Header/Header";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";

export default function Shows() {
    return (
        <div className={styles.component}>
            <div className={styles.container}>
                {/* <Header /> */}
                <div className={styles.home} style={{ backgroundImage: "url('/img/shows/shows_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>НАШИ</h1>
                        <h1 className={styles.header}>СПЕКТАКЛИ</h1>
                    </div>
                </div>
                {/* <div className={styles.payment_card}> */}
                <PaymentCardCommon type={'shows'} />
                {/* </div> */}
            </div>
            <div className={styles.content}>
                <ShowssSchedule />
            </div>
        </div>
    );
}
