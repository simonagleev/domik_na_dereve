'use client'

import FeedbackRequestForm from "@/components/FeedbackRequestForm/FeedbackRequestForm";
import styles from "./CreativeWorkshops.module.css";
import PaymentCardCommon from "@/components/PaymentCardCommon/PaymentCardCommon";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";
import SuccessComponent from "@/components/SuccessComponent/SucceessComponent";

export default function CreativeWorkshops() {
    const {isFeedbackRequestFormOpen, isSuccess} = useFeedbackRequestFormStore();
    return (
        <div className={styles.component}>
            <div className={styles.container}>
                <div className={styles.home} style={{ backgroundImage: "url('/img/creative_workshops/creative_bg.jpg')" }}>
                    <div className={styles.main_header_container}>
                        <h1 className={styles.header}>ТВОРЧЕСКИЕ</h1>
                        <h1 className={styles.header}>МАСТЕРСКИЕ</h1>
                    </div>
                </div>
                <PaymentCardCommon type={'creative_workshops'} />
            </div>

            {isFeedbackRequestFormOpen ? <FeedbackRequestForm type={'creative_workshops'}/> : null}
            {/* {isSuccess ? <SuccessComponent/> : null} */}
        </div>
    );
}
