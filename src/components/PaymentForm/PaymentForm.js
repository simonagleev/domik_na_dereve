'use client';

import styles from './PaymentForm.module.css';
import { usePaymentModalStore } from '@/store/PaymentModalStore';
import { normalizeRuPhoneInput } from '@/lib/phoneInput';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

/**
 * @param {'standalone' | 'embedded'} variant — embedded: без второго оверлея (внутри модалки расписания)
 */
export default function PaymentForm({ type, data, variant = 'standalone' }) {
  const isEmbedded = variant === 'embedded';
  const price = useMemo(() => Number(data?.Price ?? data?.price ?? 0), [data]);

  const {
    closePaymentFormModal,
    count,
    updateCount,
    formData,
    updateFormData,
    resetCount,
    resetFormData,
  } = usePaymentModalStore();

  const maxTickets = Math.max(0, Number(data?.RemainingCount ?? 0));

  useEffect(() => {
    updateCount(() => 1);
  }, [data?.ID, updateCount]);

  useEffect(() => {
    if (maxTickets > 0) {
      updateCount((c) => (c > maxTickets ? maxTickets : c));
    }
  }, [data?.ID, maxTickets, updateCount]);

  const handleClickOutside = (e) => {
    if (!isEmbedded && e.target === e.currentTarget) {
      resetCount();
      resetFormData();
      closePaymentFormModal();
    }
  };

  const handleDecrement = () => {
    if (count > 1) {
      updateCount((prevCount) => {
        const newCount = prevCount - 1;
        updateFormData('amount', newCount * price);
        return newCount;
      });
    }
  };

  const handleIncrement = () => {
    if (count < maxTickets) {
      updateCount((prevCount) => {
        const newCount = prevCount + 1;
        updateFormData('amount', newCount * price);
        return newCount;
      });
    }
  };

  useEffect(() => {
    updateFormData('type', type);
    updateFormData('date', data?.StartDateTime);
    updateFormData('itemID', data?.ID);
    updateFormData('amount', count * price);
  }, [data, type, count, price, updateFormData]);

  const handleClose = () => {
    resetCount();
    resetFormData();
    closePaymentFormModal();
  };

  const handlePhoneChange = (e) => {
    updateFormData('phone', normalizeRuPhoneInput(e.target.value));
  };

  const handlePhonKeyDown = (e) => {
    const inputValue = e.target.value;
    if (e.key === ' ') {
      e.preventDefault();
      return;
    }
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
    e.preventDefault();

    if (!formData.phone?.startsWith('+7') || formData.phone.length !== 12) {
      alert('Введите корректный номер телефона в формате +7XXXXXXXXXX');
      return;
    }

    if (
      !formData.childName?.trim() ||
      !formData.clientName?.trim() ||
      !formData.email?.trim()
    ) {
      alert('Пожалуйста, заполните имя ребёнка, имя родителя и email.');
      return;
    }

    if (count > maxTickets || maxTickets <= 0) {
      alert('Недостаточно билетов на выбранную дату.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formData.amount,
          description: 'Оплата заказа',
          return_url: `${window.location.origin}/payment-return`,
          phone: formData.phone,
          itemID: formData.itemID,
          type,
          info: formData.info,
          count,
          child_name: formData.childName.trim(),
          client_name: formData.clientName.trim(),
        }),
      });

      const dataResponse = await response.json();
      if (response.ok && dataResponse.confirmationUrl) {
        const paymentId =
          dataResponse.paymentId ||
          new URL(dataResponse.confirmationUrl).searchParams.get('orderId');
        try {
          if (paymentId) {
            sessionStorage.setItem('yookassa_pending_payment_id', paymentId);
          }
        } catch (_) {
          /* sessionStorage недоступен */
        }
        const requestBody = {
          childName: formData.childName.trim(),
          clientName: formData.clientName.trim(),
          phone: formData.phone,
          email: formData.email,
          type,
          count,
          orderID: paymentId,
          title: type === 'workshop' ? data.Name : data.ShowID,
          date: data.StartDateTime,
        };

        handleSendTelegram(requestBody);

        window.location.href = dataResponse.confirmationUrl;
      } else {
        console.error('Ошибка при получении ссылки на оплату:', dataResponse);
        alert(dataResponse?.error || 'Не удалось создать платёж. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка при запросе на сервер:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTelegram = (payload) => {
    try {
      fetch('/api/send-data-tg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((d) => {
          console.log('Ответ от сервера:', d);
        })
        .catch((error) => console.error('Ошибка:', error));
    } catch (error) {
      console.error('Ошибка при отправке данных (ТГ):', error);
    }
  };

  const sanitizePersonName = (value) => {
    let v = value.replace(/[^a-zA-Zа-яА-ЯёЁ-\s]/g, '');
    if (v.startsWith('-')) v = v.slice(1);
    v = v.replace(/--/g, '-');
    v = v.replace(/\s\s+/g, ' ');
    return v;
  };

  const [agreePersonalData, setAgreePersonalData] = useState(false);
  const [agreeOffer, setAgreeOffer] = useState(false);

  const formBody = !loading ? (
        <div
          className={
            isEmbedded
              ? `${styles.payment_form_embedded}`
              : `client-modal-panel ${styles.payment_form}`
          }
        >
          {!isEmbedded ? (
            <div className={styles.close_button_container}>
              <button className={styles.close_button} onClick={handleClose} aria-label="Закрыть форму">
                &times;
              </button>
            </div>
          ) : null}

          <h2 className={styles.payment_form_heading}>Заполните форму для записи</h2>
          <form onSubmit={handlePayment}>
            <div className={styles.form_fields_grid}>
              <div className={styles.form_group}>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  placeholder="Имя ребёнка"
                  value={formData.childName}
                  onChange={(e) => updateFormData('childName', sanitizePersonName(e.target.value))}
                />
              </div>
              <div className={styles.form_group}>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  placeholder="Имя родителя (заказчик)"
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', sanitizePersonName(e.target.value))}
                />
              </div>
              <div className={styles.form_group}>
                <input
                  id="phone"
                  name="phone"
                  placeholder="Номер телефона для связи"
                  maxLength={12}
                  minLength={12}
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e)}
                  onKeyDown={(e) => handlePhonKeyDown(e)}
                />
              </div>
              <div className={styles.form_group}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
            </div>

            <div className={`${styles.form_group} ${styles.form_group_counter}`}>
              <div className={styles.counter_container}>
                <div className={styles.count_btn} onClick={handleDecrement}>
                  -
                </div>
                <div className={styles.count}>{count}</div>
                <div className={styles.count_btn} onClick={handleIncrement}>
                  +
                </div>
              </div>
              <div className={styles.sum_block}>
                Сумма: <b>{formData.amount ? formData.amount : price}</b> руб.
              </div>
            </div>

            <button
              className={`${!agreePersonalData || !agreeOffer ? styles.submit_btn_disabled : styles.submit_btn}`}
              type="submit"
              disabled={!agreePersonalData || !agreeOffer}
            >
              {type === 'show'
                ? 'Купить билеты'
                : type === 'workshop'
                  ? 'Записаться на мастер класс'
                  : 'Отправить'}
            </button>
          </form>
          <div className={styles.check_box}>
            <label className={styles.check_box_label}>
              <input
                type="checkbox"
                checked={agreePersonalData}
                onChange={(e) => setAgreePersonalData(e.target.checked)}
              />
              <span>
                Даю{' '}
                <Link
                  href="/docs/personal_data.html"
                  target="_blank"
                  style={{ color: 'rgba(124, 152, 120, 1)', fontWeight: 600 }}
                >
                  согласие
                </Link>{' '}
                на получение рекламных и информационных рассылок
              </span>
            </label>
          </div>

          <div className={styles.check_box}>
            <label className={styles.check_box_label}>
              <input
                type="checkbox"
                checked={agreeOffer}
                onChange={(e) => setAgreeOffer(e.target.checked)}
              />
              <span>
                Оплачивая, я соглашаюсь с{' '}
                <Link
                  href="/docs/oferta.html"
                  target="_blank"
                  style={{ color: 'rgba(124, 152, 120, 1)', fontWeight: 600 }}
                >
                  офертой
                </Link>{' '}
                и обработкой своих персональных данных
              </span>
            </label>
          </div>

          <h3 className={styles.payment_form_heading} style={{ marginBottom: '10px' }}>
            Или свяжитесь с нами
            <br /> самостоятельно по номеру:
          </h3>
          <h3 className={styles.payment_form_heading} style={{ marginBottom: '10px' }}>
            +7 (914) 932-28-82
          </h3>
        </div>
  ) : (
    <div className={styles.loading_state}>Загрузка…</div>
  );

  if (isEmbedded) {
    return formBody;
  }

  return (
    <div className="client-modal-overlay" onClick={handleClickOutside}>
      {formBody}
    </div>
  );
}
