'use client'

import FeedbackRequestForm from "@/components/FeedbackRequestForm/FeedbackRequestForm";
import styles from "./AfterSchoolCare.module.css";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";
import AboutAfterSchoolCare from "./components/aboutAfterSchoolCare/component";

export default function AfterSchoolCare() {
    const { isFeedbackRequestFormOpen } = useFeedbackRequestFormStore();

    return (
        <div className={styles.component}>
            <div className={styles.container}>
                <div className={styles.home} style={{ backgroundImage: "url('/img/day_care/day_care.png')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>ПРОДЛЕНКА</h1>
                    </div>
                </div>
                <PaymentCardCommon type={'afterSchoolCare'} />
            </div>
            <div className={styles.content}>
                <h2 className={styles.heading}>Продленка в «Домике на дереве»</h2>
                <AboutAfterSchoolCare />
            </div>
            {isFeedbackRequestFormOpen ? <FeedbackRequestForm type={'after_school_care'} /> : null}
        </div>
    );
}
