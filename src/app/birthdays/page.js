'use client'

import FeedbackRequestForm from "@/components/FeedbackRequestForm/FeedbackRequestForm";
import styles from "./Birthdays.module.css";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";
import SuccessComponent from "@/components/SuccessComponent/SucceessComponent";
import AboutBirthdays from "./components/aboutBirthdays/component";

export default function Birthdays() {
    const { isFeedbackRequestFormOpen, isSuccess } = useFeedbackRequestFormStore();

    return (
        <div className={styles.component}>
            <div className={styles.container}>
                <div className={styles.home} style={{ backgroundImage: "url('/img/birthdays/bd_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>ДНИ</h1>
                        <h1 className={styles.header}>РОЖДЕНИЯ</h1>
                    </div>
                </div>
                <PaymentCardCommon type={'birthdays'} />
            </div>
            <div className={styles.content}>
                <h2 className={styles.heading}>День рождения в «Домике на дереве»</h2>
                <AboutBirthdays />
            </div>
            {isFeedbackRequestFormOpen ? <FeedbackRequestForm type={'birthday'} /> : null}
        </div>
    );
}
