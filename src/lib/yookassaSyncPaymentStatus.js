import { getYooKassaCredentials } from '@/lib/yookassaCredentials';
import { pgQuery } from '@/lib/postgres';

/**
 * Неуспешная оплата (отмена до списания): возвращаем места на слот и ставим canceled.
 * Идемпотентно — повторный вебхук/sync не удваивает remaining_count.
 * Денежных возвратов после оплаты у нас нет — статус refunded только обновляем в БД, слот не трогаем.
 */
export async function applyCanceledPaymentAndRestoreSeats(paymentId) {
  const r = await pgQuery(
    `
    UPDATE online_transactions
    SET status = 'canceled'
    WHERE order_acquiring_id = $1
      AND status IN ('pending', 'waiting_for_capture')
    RETURNING "type", item_id, ticket_count
    `,
    [paymentId]
  );

  if (r.rowCount === 0) {
    return { restored: false };
  }

  const tx = r.rows[0];
  const ticketCount = Number(tx.ticket_count) || 0;
  const itemId = tx.item_id;

  if (ticketCount > 0 && itemId != null) {
    if (tx.type === 'show') {
      await pgQuery(
        `UPDATE shows_schedule SET remaining_count = remaining_count + $1 WHERE id = $2`,
        [ticketCount, itemId]
      );
    } else if (tx.type === 'workshop') {
      await pgQuery(
        `UPDATE workshop_schedule SET remaining_count = remaining_count + $1 WHERE id = $2`,
        [ticketCount, itemId]
      );
    }
  }

  return { restored: true };
}

/**
 * Запрашивает платёж в YooKassa и приводит строку online_transactions в соответствие
 * (как вебхук и публичный /api/yookassa-sync-payment-status).
 *
 * @param {string} paymentId — order_acquiring_id / id платежа в YooKassa
 * @returns {Promise<
 *   | { ok: true; ykStatus: string; previousDbStatus: string; updated: boolean }
 *   | { ok: false; error: string; status?: number }
 * >}
 */
export async function syncOnlineTransactionWithYooKassa(paymentId) {
  const { rows: existing } = await pgQuery(
    `SELECT status FROM online_transactions WHERE order_acquiring_id = $1`,
    [paymentId]
  );
  const previousDbStatus = existing[0]?.status ?? null;
  if (previousDbStatus === null) {
    return { ok: false, error: 'Транзакция не найдена в базе', status: 404 };
  }

  const { shopId, secretKey } = getYooKassaCredentials();
  if (!shopId || !secretKey) {
    return { ok: false, error: 'Платёжная система не настроена (YooKassa).' };
  }

  const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
    },
  });

  if (!ykRes.ok) {
    const err = await ykRes.json().catch(() => ({}));
    console.error('[yookassaSync] YooKassa GET failed', ykRes.status, err);
    return { ok: false, error: 'Ошибка запроса к YooKassa', status: 502 };
  }

  const payment = await ykRes.json();
  const ykStatus = payment.status;

  if (ykStatus === previousDbStatus) {
    return { ok: true, ykStatus, previousDbStatus, updated: false };
  }

  if (ykStatus === 'succeeded') {
    const r = await pgQuery(
      `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
      [ykStatus, paymentId]
    );
    if (r.rowCount === 0) {
      console.warn('[yookassaSync] succeeded, строка не найдена', paymentId);
    }
    return { ok: true, ykStatus, previousDbStatus, updated: r.rowCount > 0 };
  }

  if (ykStatus === 'canceled') {
    const { restored } = await applyCanceledPaymentAndRestoreSeats(paymentId);
    return { ok: true, ykStatus, previousDbStatus, updated: restored };
  }

  if (ykStatus === 'refunded') {
    const r = await pgQuery(
      `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
      [ykStatus, paymentId]
    );
    return { ok: true, ykStatus, previousDbStatus, updated: r.rowCount > 0 };
  }

  return { ok: true, ykStatus, previousDbStatus, updated: false };
}
