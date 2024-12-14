'use client'
import styles from "./PaymentForm.module.css";
import Image from "next/image";
import { useState } from 'react';
import { usePaymentModalStore } from "@/store/PaymentModalStore";

export default function PaymentForm() {
    const closeModal = usePaymentModalStore((state) => state.closeModal);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeModal();
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            <div className={styles.payment_form}>
                <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
                <form>
                    <div className={styles.form_group}>
                        <label htmlFor="name">Имя ребенка</label>
                        <input type="text" id="name" name="name" />
                    </div>
                    <div className={styles.form_group}>
                        <label htmlFor="phone">номер телефона для связи</label>
                        <textarea id="phone" name="phone"></textarea>
                    </div>
                    <div className={styles.form_group}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" />
                    </div>
                    <button type="submit">Отправить</button>
                </form>
            </div>
        </div>
    );
}
