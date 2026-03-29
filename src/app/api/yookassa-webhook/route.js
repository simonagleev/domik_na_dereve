import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';

/** Отмена/возврат: вернуть билеты на слот и обновить статус в online_transactions. */
const REVERT_STATUSES = ['canceled', 'refunded'];

export async function POST(request) {
  try {
    const body = await request.json();
    const { object } = body;
    const { id: orderAcquiringID, status: newStatus } = object;

    if (newStatus === 'succeeded') {
      const r = await pgQuery(
        `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
        [newStatus, orderAcquiringID]
      );
      if (r.rowCount === 0) {
        console.warn('yookassa-webhook: нет строки online_transactions для succeeded', orderAcquiringID);
      }
      return NextResponse.json({ success: true });
    }

    if (REVERT_STATUSES.includes(newStatus)) {
      const { rows } = await pgQuery(
        `SELECT "type", item_id, ticket_count FROM online_transactions WHERE order_acquiring_id = $1`,
        [orderAcquiringID]
      );

      if (rows.length === 0) {
        console.warn('yookassa-webhook: нет транзакции для отмены/возврата', orderAcquiringID);
        return NextResponse.json({ success: true });
      }

      const tx = rows[0];
      const ticketCount = Number(tx.ticket_count) || 0;
      const itemId = tx.item_id;

      if (ticketCount > 0 && itemId != null) {
        if (tx.type === 'show') {
          await pgQuery(
            `UPDATE shows_schedule SET remaining_count = remaining_count + $1 WHERE id = $2`,
            [ticketCount, itemId]
          );
        } else if (tx.type === 'mk') {
          await pgQuery(
            `UPDATE workshop_schedule SET remaining_count = remaining_count + $1 WHERE id = $2`,
            [ticketCount, itemId]
          );
        }
      }

      await pgQuery(
        `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
        [newStatus, orderAcquiringID]
      );

      return NextResponse.json({ success: true });
    }

    console.log(`yookassa-webhook: статус ${newStatus} для ${orderAcquiringID}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    return NextResponse.json({ error: 'Ошибка обработки вебхука' }, { status: 500 });
  }
}
