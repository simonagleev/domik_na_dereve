'use client'

import styles from "./PaymentButton.module.css";
import { usePaymentModalStore } from "@/store/PaymentModalStore";

export default function PaymentButton({ type, handler }) {
    const openModal = usePaymentModalStore((state) => state.openModal);

    return (
        <button className={styles.payment_btn} onClick={handler ? handler : () => console.log('no handler')}>
            {type === 'main' ?
                'Купить билеты' : type === 'mk' ?
                    'Записаться на МК' :
                    'Узнать стоимость'}
        </button>
    );
}
