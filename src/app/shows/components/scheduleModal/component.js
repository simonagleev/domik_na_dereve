'use client';

import styles from './scheduleModal.module.css';
import cm from '@/components/clientModal/clientModal.module.css';
import { useShowsStore } from '@/store/showsStore';
import ItemCard from './ItemCard';
import { usePaymentModalStore } from '@/store/PaymentModalStore';
import PaymentForm from '@/components/PaymentForm/PaymentForm';

export default function ScheduleModal() {
  const pickedShow = useShowsStore((state) => state.pickedShow);
  const closeModal = useShowsStore((state) => state.closeModal);
  const currentShowItem = useShowsStore((state) => state.currentShowItem);

  const isPaymentFormModalOpen = usePaymentModalStore((s) => s.isPaymentFormModalOpen);
  const closePaymentFormModal = usePaymentModalStore((s) => s.closePaymentFormModal);
  const resetCount = usePaymentModalStore((s) => s.resetCount);
  const resetFormData = usePaymentModalStore((s) => s.resetFormData);

  const handleCloseAll = () => {
    closePaymentFormModal();
    resetCount();
    resetFormData();
    closeModal();
  };

  const handleBackToSchedule = () => {
    closePaymentFormModal();
    resetCount();
    resetFormData();
  };

  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseAll();
    }
  };

  if (!pickedShow?.schedules?.length) {
    return null;
  }

  return (
    <div className={cm.overlay} onClick={handleClickOutside}>
      <div
        className={`${cm.panelWide} ${
          isPaymentFormModalOpen ? cm.panelWidePayment : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal_top_bar}>
          <div className={styles.modal_top_side}>
            {isPaymentFormModalOpen ? (
              <button
                type="button"
                className={styles.back_btn}
                onClick={handleBackToSchedule}
                aria-label="Назад к выбору даты"
              >
                ←
              </button>
            ) : (
              <span className={styles.back_btn_placeholder} aria-hidden />
            )}
          </div>
          <div className={styles.stepper} role="status" aria-live="polite">
            <span
              className={!isPaymentFormModalOpen ? styles.step_label_active : styles.step_label}
            >
              1. Дата сеанса
            </span>
            <span className={styles.step_arrow} aria-hidden>
              →
            </span>
            <span
              className={isPaymentFormModalOpen ? styles.step_label_active : styles.step_label}
            >
              2. Оплата
            </span>
          </div>
          <div className={styles.modal_top_side}>
            <button
              type="button"
              className={styles.close_button_bar}
              onClick={handleCloseAll}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        {!isPaymentFormModalOpen && (
          <div className={styles.schedule_items_wrap}>
            {pickedShow.schedules.map((e, index) => (
              <ItemCard data={e} key={e.ID ?? index} />
            ))}
          </div>
        )}

        {isPaymentFormModalOpen && currentShowItem && (
          <div className={styles.payment_embed_wrap}>
            <PaymentForm type="show" data={currentShowItem} variant="embedded" />
          </div>
        )}
      </div>
    </div>
  );
}
