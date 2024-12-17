'use client'
import styles from "./scheduleModal.module.css";
import { useShowsStore } from "@/store/showsStore";
import ItemCard from "./ItemCard";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import PaymentForm from "@/components/PaymentForm/PaymentForm";

export default function ScheduleModal({ }) {
    const pickedShow = useShowsStore((state) => state.pickedShow);
    const closeModal = useShowsStore((state) => state.closeModal);
    const { isPaymentFormModalOpen } = usePaymentModalStore();
    const currentShowItem = useShowsStore((state) => state.currentShowItem);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeModal();
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside} >
            <div className={styles.form_container}>
                {/* Кнопка крестик */}
                <button className={styles.close_button} onClick={closeModal} aria-label="Закрыть форму">
                    &times;
                </button>
                {pickedShow.schedules.map((e, index) => {
                    return (
                        < ItemCard data={e} key={e.id || index} />)
                })}

                {isPaymentFormModalOpen && currentShowItem && (
                    <PaymentForm type={'show'} data={currentShowItem} />)}
            </div>
        </div>
    );
}
