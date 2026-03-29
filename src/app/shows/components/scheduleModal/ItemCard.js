'use client';

import styles from './scheduleModal.module.css';
import { useShowsStore } from '@/store/showsStore';
import { usePaymentModalStore } from '@/store/PaymentModalStore';

function formatDateRu(datePart) {
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return datePart;
  return `${d}.${m}.${y}`;
}

function parseStartParts(startDateTime) {
  const s = String(startDateTime || '').trim();
  if (!s) return { datePart: '', timeHm: '' };
  if (s.includes('T')) {
    const [datePart, rest] = s.split('T');
    const timeHm = (rest || '').replace('Z', '').slice(0, 5);
    return { datePart, timeHm };
  }
  const parts = s.split(/\s+/);
  const datePart = parts[0] || '';
  const timeHm = (parts[1] || '').slice(0, 5);
  return { datePart, timeHm };
}

export default function ItemCard({ data }) {
  const { isPaymentFormModalOpen, openPaymentFormModal } = usePaymentModalStore();
  const updateCurrentShowItem = useShowsStore((state) => state.updateCurrentShowItem);

  const remaining = Number(data.RemainingCount ?? 0);
  const disabled = remaining <= 0;
  const lowStock = remaining > 0 && remaining <= 3;

  const handleClick = () => {
    if (disabled) return;
    updateCurrentShowItem(data);
    if (!isPaymentFormModalOpen) openPaymentFormModal();
  };

  const { datePart, timeHm } = parseStartParts(data.StartDateTime);

  return (
    <div className={styles.item} key={data.ID}>
      <div className={styles.item_line}>
        <h2 className={styles.date}>{datePart ? formatDateRu(datePart) : '—'}</h2>
      </div>
      <div className={styles.item_line}>
        <p className={styles.time}>{timeHm || '—'}</p>
      </div>
      {lowStock ? (
        <div className={styles.item_line}>
          <p className={styles.remainings}>Осталось билетов: {remaining}</p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        className={`${styles.buy_btn} ${disabled ? styles.buy_btn_disabled : ''}`}
        onClick={handleClick}
      >
        Купить
      </button>
    </div>
  );
}
