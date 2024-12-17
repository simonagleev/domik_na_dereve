'use client'
import styles from "./PaymentForm.module.css";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import axios from 'axios';
import { useEffect } from "react";

export default function PaymentForm({ type, data }) {
    const {
        closePaymentFormModal,
        count,
        updateCount,
        formData,
        updateFormData
    } = usePaymentModalStore();

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closePaymentFormModal();
        }
    };

    const handleDecrement = () => {
        if (count > 1) {
            updateCount((prevCount) => {
                const newCount = prevCount - 1;
                updateFormData('amount', newCount * data.Price);
    
                return newCount; // Возвращаем обновленное состояние
            })
        } else {
            console.log('MINIMUM 1 ticket')
        }
    }

    const handleIncrement = () => {
        if(count < data.RemainingCount) {
            updateCount((prevCount) => {
                const newCount = prevCount + 1;
                updateFormData('amount', newCount * data.Price);
        
                return newCount;
            })
        } else (
            console.log('Превышен лимит билетов')
        )

    }

    useEffect(() => {
        updateFormData('type', type)
        updateFormData('date', data.StartDateTime)
        updateFormData('itemID', data.ID)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();



        // try {
        //     // Отправка данных в Telegram через API
        //     await axios.post('/api/sendFormData', formData);
        //     alert('Данные отправлены в Telegram!');
        //     closePaymentFormModal();
        // } catch (error) {
        //     console.error('Error sending data to Telegram:', error);
        //     alert('Ошибка отправки данных.');
        // }
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            <div className={styles.payment_form}>
                {/* Кнопка крестик */}
                <div className={styles.close_button_container}>
                    <button className={styles.close_button} onClick={closePaymentFormModal} aria-label="Закрыть форму">
                        &times;
                    </button>
                </div>

                <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.form_group}>
                        <input type="text" id="name" name="name" placeholder="Имя ребенка"
                            value={formData.name || ''}
                            onChange={(e) => updateFormData('name', e.target.value)} />
                    </div>
                    <div className={styles.form_group}>
                        <input id="phone" name="phone" placeholder="Номер телефона для связи"
                            value={formData.phone || ''}
                            onChange={(e) => updateFormData('phone', e.target.value)} />
                    </div>
                    <div className={styles.form_group}>
                        <input type="email" id="email" name="email" placeholder="Email"
                            value={formData.email || ''}
                            onChange={(e) => updateFormData('email', e.target.value)} />
                    </div>

                    <div className={styles.form_group}>
                        <div className={styles.counter_container}>
                            <div className={styles.count_btn} onClick={handleDecrement}>-</div>
                            <div className={styles.count}>{count}</div>
                            <div className={styles.count_btn} onClick={handleIncrement}>+</div>
                        </div>
                        <div className={styles.sum_block}>
                            Сумма: <b>{formData.amount ? formData.amount : data.Price}</b> руб.
                        </div>
                    </div>

                    <button className={styles.submit_btn} type="submit">
                        {type === 'show' ?
                            'Купить билеты' : type === 'mk' ?
                                'Записаться на мастер класс' :
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
