'use client'
import styles from "./PaymentForm.module.css";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import axios from 'axios';
import { useEffect, useState } from "react";

export default function PaymentForm({ type, data }) {
    console.log(type)
    console.log(data)

    const isDev = process.env.NODE_ENV === 'development';

    const {
        closePaymentFormModal,
        count,
        updateCount,
        formData,
        updateFormData,
        resetCount,
        resetFormData
    } = usePaymentModalStore();

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            resetCount()
            resetFormData()
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
        console.log('TESt 2')
        console.log(data)
        if (count < data.RemainingCount) {
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
        updateFormData('amount', count * data.Price);
    }, [data, type])

    const handleClose = () => {
        resetCount()
        resetFormData()
        closePaymentFormModal();
    }

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

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Убираем все символы, кроме цифр и знака +
        value = value.replace(/[^0-9+]/g, '');
        // Если это первый символ и он не равен +, заменяем его на +7
        if (value && value[0] !== '+') {
            value = `+7${value.slice(1)}`; // Заменяем первый символ на +7
        }
        updateFormData('phone', value);
    };

    const handlePhonKeyDown = (e) => {
        const inputValue = e.target.value;
    
        // Проверяем текущую длину номера и запрещаем ввод, если превышен лимит
        if (
            inputValue.startsWith('+7') &&
            inputValue.length >= 12 &&
            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
        ) {
            e.preventDefault();
        }
    };

    const [loading, setLoading] = useState(false);

    const handlePayment = async (e) => {
        
        if (!formData.name || !formData.phone || !formData.email) { //проверка на заполнение данных
            e.preventDefault(); //чтоб не закрывалась форма после алерта
            alert('Пожалуйста, заполните все поля!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: formData.amount,
                    description: 'Оплата заказа',
                    return_url: isDev? 'http://localhost:3000/' : 'https://domiknadereve-irk.ru', //Доделать, прописть все ссылки на проде потом
                    phone: formData.phone,
                    itemID: formData.itemID,
                    type: type,
                    info: formData.info,
                    count: count
                }),
            });

            const data = await response.json();

            if (response.ok && data.confirmationUrl) {
                console.log('COOL')
                window.location.href = data.confirmationUrl; // Редирект на ЮKassa
            } else {
                console.error('Ошибка при получении ссылки на оплату:', data);
            }
        } catch (error) {
            console.error('Ошибка при запросе на сервер:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = () => {
        console.log('PAYMENT STARTED')
        console.log(formData)
    }

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            {!loading ?
                <div className={styles.payment_form}>
                    {/* Кнопка крестик */}
                    <div className={styles.close_button_container}>
                        <button className={styles.close_button} onClick={handleClose} aria-label="Закрыть форму">
                            &times;
                        </button>
                    </div>

                    <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
                    <form onSubmit={handlePayment}>
                        <div className={styles.form_group}>
                            <input type="text" id="name" name="name" placeholder="Имя ребенка"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)} />
                        </div>
                        <div className={styles.form_group}>
                            <input id="phone" name="phone" placeholder="Номер телефона для связи"
                                maxLength={12}
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange(e)} 
                                onKeyDown={(e) => handlePhonKeyDown(e)}
                                />
                        </div>
                        <div className={styles.form_group}>
                            <input type="email" id="email" name="email" placeholder="Email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)} />
                        </div>

                        <div className={styles.form_group}>
                            <div className={styles.counter_container}>
                                <div className={styles.count_btn} onClick={handleDecrement}>-</div>
                                <div className={styles.count}>{count}</div>
                                <div className={styles.count_btn} onClick={handleIncrement}>+</div>
                            </div>
                            <div className={styles.sum_block} onClick={handleTest}>
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
                </div> : <div>LOADING</div>}
        </div>
    );
}
