'use client'
import styles from "./scheduleModal.module.css";
import Image from "next/image";
import { useShowsStore } from "@/store/showsStore";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import PaymentForm from "@/components/PaymentForm/PaymentForm";

export default function ItemCard({ data }) {
    const {
        isPaymentFormModalOpen,
        closePaymentFormModal,
        openPaymentFormModal,
    } = usePaymentModalStore();

    const closeModal = useShowsStore((state) => state.closeModal);
    const updateCurrentShowItem = useShowsStore((state) => state.updateCurrentShowItem)

    const handleClick = () => {
        updateCurrentShowItem(data)

        !isPaymentFormModalOpen ? openPaymentFormModal() : console.log('PAYMENT FORM ALREADY OPENED')
    }

    return (
        <div className={styles.item} key={data.ID}>
            <div className={styles.item_line}>
                <h2 className={styles.date}>{data.StartDateTime.split('T')[0]}</h2>
            </div>
            <div className={styles.item_line}>
                <p className={styles.time}>{data.StartDateTime.split('T')[1].substring(0, 5)}</p>
            </div>
            <div className={styles.item_line}>
                <p className={styles.remainings}> Билетов осталось: {data.RemainingCount}</p>
            </div>

            <button className={styles.buy_btn} onClick={handleClick}>
                Купить
            </button>

            {/* {isPaymentFormModalOpen && <PaymentForm type={'show'} data={data} key={data.ID}/>} */}
        </div>
    )
}
