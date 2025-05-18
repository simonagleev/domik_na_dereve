'use client'
import styles from "./FeedbackRequestForm.module.css";
import { useEffect, useState } from "react";
import { useFeedbackRequestFormStore } from "@/store/feedbackRequestFormStore";

export default function FeedbackRequestForm({ type }) {
    const {
        closeFeedbackRequestForm,
        formData,
        updateFormData,
        resetFormData,
        setIsSuccess
    } = useFeedbackRequestFormStore();

    const [loading, setLoading] = useState(false);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            resetFormData()
            closeFeedbackRequestForm();
        }
    };

    useEffect(() => {
        updateFormData('type', type)
    }, [type, updateFormData])

    const handleClose = () => {
        resetFormData()
        closeFeedbackRequestForm();
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

    const handleAgeChange = (e) => {
        let value = e.target.value;
        // Убираем все символы, кроме цифр
        value = value.replace(/[^0-9]/g, '');
        updateFormData('childAge', value);
    };
    const successHandler = () => {
        setIsSuccess(true)
        setTimeout(() => {
            setIsSuccess(false)
        }, 1000);
    }

    const handleSendTelegram = () => {
        try {
            fetch('/api/send-telegram-feedback-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
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
    const handleChildNameChange = (e) => {
        let value = e.target.value;

        // Разрешаем только буквы (русские, английские), дефис и пробел, убираем всё остальное
        value = value.replace(/[^a-zA-Zа-яА-ЯёЁ-\s]/g, '');

        if (value.startsWith('-')) {
            value = value.slice(1); // Убираем дефис в начале
        }
        value = value.replace(/--/g, '-');
        value = value.replace(/\s\s+/g, ' '); // Убираем двойной пробел

        updateFormData('childName', value);
    };

    const handleEventDateChange = (e) => {
        let value = e.target.value;
        updateFormData('eventDate', value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phone.startsWith('+7') || formData.phone.length !== 12) {
            alert('Введите корректный номер телефона в формате +7XXXXXXXXXX');
            return;
        }

        if (!formData.name || !formData.phone || !formData.type) { //проверка на заполнение данных
            e.preventDefault();
            alert('Пожалуйста, заполните все поля!');
            return;
        } else {
            setLoading(true);

            try {
                fetch('/api/send-feedback-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })
                    .then(response => response.json())
                    .then(data => {
                        handleSendTelegram()
                        data.success ? successHandler() : null
                    })
                    .catch(error => console.error('Ошибка:', error));
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
            handleClose()
        }
    }

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside}>
            <div className={styles.payment_form}>
                {/* Кнопка крестик */}
                <div className={styles.close_button_container}>
                    <button className={styles.close_button} onClick={handleClose} aria-label="Закрыть форму">
                        &times;
                    </button>
                </div>

                <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className={styles.form_group}>
                        <input type="text" id="name" name="name" placeholder="Имя"
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
                        <input type="text" id="childName" name="childName" placeholder="Имя ребенка"
                            value={formData.childName}
                            onChange={(e) => handleChildNameChange(e)} />
                    </div>
                    <div className={styles.form_group}>
                        <input type="text" id="childAge" name="childAge" placeholder="Возраст ребенка"
                            value={formData.childAge}
                            onChange={(e) => handleAgeChange(e)}
                            maxLength={3}
                        />
                    </div>
                    {type === 'birthday' ?
                        <div
                            className={`${styles.form_group} ${styles.date_wrapper}`}
                            onClick={() => document.getElementById('eventDate').showPicker()}
                        >
                            <input
                                className={styles.date_input}
                                type="date"
                                id="eventDate"
                                name="eventDate"
                                value={formData.eventDate ? formData.eventDate : ''}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => handleEventDateChange(e)}
                            />
                        </div> : null
                    }

                    <button className={styles.submit_btn} type="submit">
                        {type === 'show' ? 'Купить билеты'
                            : type === 'mk' ? 'Записаться на мастер класс'
                                : type === 'birthday' ? 'Узнать стоимость'
                                    : type === 'camp' ? 'Записаться'
                                        : 'Отправить'
                        }
                    </button>
                </form>

                <h2 className={styles.payment_form_heading}>
                    Или свяжитесь с нами<br /> самостоятельно по номеру:
                </h2>
                <h2 className={styles.payment_form_heading}>
                    +7 (914) 932-28-82
                </h2>
            </div>
        </div>
    );
}
