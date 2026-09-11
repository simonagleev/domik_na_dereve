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

  let statusText = '';
  if (disabled) statusText = 'Билеты закончились';
  else if (lowStock) statusText = `Осталось билетов: ${remaining}`;

  return (
    <div className={styles.item} key={data.ID}>
      <div className={`${styles.item_line} ${styles.item_line_date}`}>
        <h2 className={styles.date}>{datePart ? formatDateRu(datePart) : '—'}</h2>
      </div>
      <div className={`${styles.item_line} ${styles.item_line_time}`}>
        <p className={styles.time}>{timeHm || '—'}</p>
      </div>

      {/* Всегда рендерим строку, просто прячем текст, если статус не нужен */}
      <div
        className={styles.item_line}
        style={{ visibility: statusText ? 'visible' : 'hidden' }}
      >
        <p className={styles.remainings}>{statusText || '\u00A0'}</p>
      </div>

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
