'use client'
import FeedbackRequestForm from "@/components/FeedbackRequestForm/FeedbackRequestForm";
import styles from "./camp.module.css";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";
import AboutCamp from "./components/aboutCamp/component";

export default function Camp() {
    const { isFeedbackRequestFormOpen } = useFeedbackRequestFormStore();

    return (
        <div className={styles.component}>
            <div className={styles.container}>
                <div className={styles.home} style={{ backgroundImage: "url('/img/camp/camp_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>Летний</h1>
                        <h1 className={styles.header}>Лагерь</h1>
                    </div>
                </div>
                <PaymentCardCommon type={'camp'} />
            </div>
            <div className={styles.content}>
                <h2 className={styles.heading}>Летний лагерь с “Домиком на дереве”</h2>
                <AboutCamp />
            </div>
            {isFeedbackRequestFormOpen ? <FeedbackRequestForm type={'camp'} /> : null}
        </div>
    );
}
