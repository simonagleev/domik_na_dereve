import styles from "./Workshops.module.css";
// import Header from "@/components/Header/Header";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";
import WorkshopsSchedule from "./components/schedule/component";

export default function Workshops() {
    return (
        <div className={styles.component}>
            <div className={styles.container}>
                {/* <Header /> */}
                <div className={styles.home} style={{ backgroundImage: "url('/img/workshops_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>МАСТЕР</h1>
                        <h1 className={styles.header}>КЛАССЫ</h1>
                    </div>
                    <div className={styles.payment_card}>
                        <PaymentCardCommon type={'mk'} />
                    </div>
                </div>
            </div>
            <div className={styles.content}>
                <WorkshopsSchedule />
            </div>
        </div>
    );
}
