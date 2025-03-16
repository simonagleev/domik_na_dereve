'use client'
import FeedbackRequestForm from "@/components/FeedbackRequestForm/FeedbackRequestForm";
import styles from "./feedbackRequestModal.module.css";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";

export default function FeedbackRequestModal({ }) {
    const {isFeedbackRequestFormOpen, closeFeedbackRequestForm} = useFeedbackRequestFormStore();

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeFeedbackRequestForm();
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside} >
            <div className={styles.form_container}>
                {/* Кнопка крестик */}
                <button className={styles.close_button} onClick={closeFeedbackRequestForm} aria-label="Закрыть форму">
                    &times;
                </button>

                <FeedbackRequestForm type={'birthday'}/>
            </div>
        </div>
    );
}
