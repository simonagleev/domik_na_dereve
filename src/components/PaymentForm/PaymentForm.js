'use client'
import styles from "./PaymentForm.module.css";
import Image from "next/image";
import { useState } from 'react';
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import axios from 'axios';

export default function PaymentForm({ type, date, time, title }) {
    const closeModal = usePaymentModalStore((state) => state.closeModal);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeModal();
        }
    };

    //
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '', 
        date: date ? date : '',
        time: time ? time: '',
        title: title ? title: ''
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Отправка данных в Telegram через API
            await axios.post('/api/sendFormData', formData);
            alert('Данные отправлены в Telegram!');
            closeModal();
        } catch (error) {
            console.error('Error sending data to Telegram:', error);
            alert('Ошибка отправки данных.');
        }
    };
    //

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            <div className={styles.payment_form}>
                {/* Кнопка крестик */}
                <div className={styles.close_button_container}>
                    <button className={styles.close_button} onClick={closeModal} aria-label="Закрыть форму">
                        &times;
                    </button>
                </div>

                <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.form_group}>
                        <input type="text" id="name" name="name" placeholder="Имя ребенка" 
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    />
                    </div>
                    <div className={styles.form_group}>
                        <input id="phone" name="phone" placeholder="Номер телефона для связи"
                                                    value={formData.phone}
                                                    onChange={handleChange}></input>
                    </div>
                    <div className={styles.form_group}>
                        <input type="email" id="email" name="email" placeholder="Email" 
                                                    value={formData.email}
                                                    onChange={handleChange}/>
                    </div>
                    <button className={styles.submit_btn} type="submit">
                        {type === 'main' ?
                            'Купить билеты' : type === 'mk' ?
                                'Записатя на мастер класс' :
                                'Отправить'}
                    </button>
                </form>

                <h2 className={styles.payment_form_heading}>
                    Или свяжитесь с нами<br /> самостоятельно по номеру:
                </h2>
                <h2 className={styles.payment_form_heading}>
                    +7 (333) 355-44-77
                </h2>
            </div>
        </div>
    );
}
