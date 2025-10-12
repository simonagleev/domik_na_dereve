'use client'
import styles from "./PaymentForm.module.css";
import { usePaymentModalStore } from "@/store/PaymentModalStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentForm({ type, data }) {
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
    }, [data, type, count, updateFormData])

    const handleClose = () => {
        resetCount()
        resetFormData()
        closePaymentFormModal();
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Убираем все символы, кроме цифр и знака +
        value = value.replace(/[^0-9+]/g, '');

        // Если '+' встречается не в первой позиции, удаляем его
        if (value.indexOf('+', 1) !== -1) {
            value = value.replace(/\+/g, '');
            value = `+${value}`;
        }

        // Если это первый символ и он не равен +, заменяем его на +7
        if (value && value[0] !== '+') {
            value = `+7${value.slice(1)}`; // Заменяем первый символ на +7
        }
        updateFormData('phone', value.trim());
    };

    const handlePhonKeyDown = (e) => {
        const inputValue = e.target.value;
        if (e.key === ' ') {
            e.preventDefault();
            return;
        }
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
        if (!formData.phone.startsWith('+7') || formData.phone.length !== 12) {
            alert('Введите корректный номер телефона в формате +7XXXXXXXXXX');
            return;
        }

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
                    return_url: isDev ? 'http://localhost:3000/' : 'https://domiknadereve-irk.ru',
                    phone: formData.phone,
                    itemID: formData.itemID,
                    type: type,
                    info: formData.info,
                    count: count
                }),
            });

            const dataResponse = await response.json();
            if (response.ok && dataResponse.confirmationUrl) {
                const orderId = new URL(dataResponse.confirmationUrl).searchParams.get('orderId')
                const requestBody = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    type: type,
                    count: count,
                    orderID: orderId,
                    title: type === 'mk' ? data.Name : data.ShowID,
                    date: data.StartDateTime,
                };



                handleSendTelegram(requestBody) // Отправляем сообщение в телеграм

                window.location.href = dataResponse.confirmationUrl; // Редирект на ЮKassa
            } else {
                console.error('Ошибка при получении ссылки на оплату:', dataResponse);
            }
        } catch (error) {
            console.error('Ошибка при запросе на сервер:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleSendTelegram = (data) => {
        // console.log('requestBody')
        // console.log(JSON.stringify(data))
        try {
            fetch('/api/send-data-tg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Ответ от сервера:', data);
                    console.log('ОТПРАВЛЕНО В ТЕЛЕГРАМ')
                })
                .catch(error => console.error('Ошибка:', error));
        } catch (error) {
            console.error('Ошибка при отправке данных (ТГ):', error);
        }
    }
    const handleNameChange = (e) => {
        let value = e.target.value;

        // Разрешаем только буквы (русские, английские), дефис и пробел, убираем всё остальное
        value = value.replace(/[^a-zA-Zа-яА-ЯёЁ-\s]/g, '');

        if (value.startsWith('-')) {
            value = value.slice(1); // Убираем дефис в начале
        }
        value = value.replace(/--/g, '-');
        value = value.replace(/\s\s+/g, ' ');
        updateFormData('name', value);
    };

    const [agreePersonalData, setAgreePersonalData] = useState(false);
    const [agreeOffer, setAgreeOffer] = useState(false);

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
                                onChange={(e) => handleNameChange(e)} />
                        </div>
                        <div className={styles.form_group}>
                            <input id="phone" name="phone" placeholder="Номер телефона для связи"
                                maxLength={12}
                                minLength={12}
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
                            <div className={styles.sum_block}>
                                Сумма: <b>{formData.amount ? formData.amount : data.Price}</b> руб.
                            </div>
                        </div>

                        <button className={`${(!agreePersonalData || !agreeOffer) ? styles.submit_btn_disabled : styles.submit_btn}`}
                            type="submit"
                            disabled={!agreePersonalData || !agreeOffer}
                        >
                            {type === 'show' ?
                                'Купить билеты' : type === 'mk' ?
                                    'Записаться на мастер класс' :
                                    'Отправить'}
                        </button>
                    </form>
                    <div className={styles.check_box}>
                        <label className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={agreePersonalData}
                                onChange={(e) => setAgreePersonalData(e.target.checked)}
                            />
                            <span>
                                Даю{" "}
                                <Link href="/docs/personal_data.html" target="_blank" style={{ color: 'rgba(124, 152, 120, 1)', fontWeight: 600 }}>
                                    согласие
                                </Link>{" "}
                                на получение рекламных и информационных рассылок
                            </span>
                        </label>
                    </div>

                    <div className={styles.check_box}>
                        <label className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={agreeOffer}
                                onChange={(e) => setAgreeOffer(e.target.checked)}
                            />
                            <span>
                                Оплачивая, я соглашаюсь с{" "}
                                <Link href="/docs/oferta.html" target="_blank" style={{ color: 'rgba(124, 152, 120, 1)', fontWeight: 600 }}>
                                    офертой
                                </Link>{" "}
                                и обработкой своих персональных данных
                            </span>
                        </label>
                    </div>

                    <h2 className={styles.payment_form_heading} style={{ marginBottom: "10px" }}>
                        Или свяжитесь с нами<br /> самостоятельно по номеру:
                    </h2>
                    <h2 className={styles.payment_form_heading} style={{ marginBottom: "10px" }}>
                        +7 (914) 932-28-82
                    </h2>
                </div> : <div>LOADING</div>}
        </div>
    );
}
