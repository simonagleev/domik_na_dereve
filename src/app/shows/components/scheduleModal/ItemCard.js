'use client'
import styles from "./scheduleModal.module.css";
import { useShowsStore } from "@/store/showsStore";
import { usePaymentModalStore } from "@/store/PaymentModalStore";

export default function ItemCard({ data }) {
    const {
        isPaymentFormModalOpen,
        openPaymentFormModal,
    } = usePaymentModalStore();

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
        </div>
    )
}


