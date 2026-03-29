import { NextResponse } from 'next/server';
import { pgQuery } from '@/lib/postgres';
import { applyCanceledPaymentAndRestoreSeats } from '@/lib/yookassaSyncPaymentStatus';

export async function POST(request) {
  try {
    const body = await request.json();
    const object = body?.object;
    if (!object?.id || typeof object.status !== 'string') {
      console.warn(
        'yookassa-webhook: неожиданное тело уведомления',
        typeof body === 'object' ? JSON.stringify(body).slice(0, 800) : String(body)
      );
      return NextResponse.json({ success: true });
    }
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

    if (newStatus === 'canceled') {
      const { restored } = await applyCanceledPaymentAndRestoreSeats(orderAcquiringID);
      if (!restored) {
        const { rows } = await pgQuery(
          `SELECT status FROM online_transactions WHERE order_acquiring_id = $1`,
          [orderAcquiringID]
        );
        if (rows.length === 0) {
          console.warn('yookassa-webhook: нет транзакции для canceled', orderAcquiringID);
        }
      }
      return NextResponse.json({ success: true });
    }

    /** Редкий случай; денежных возвратов нет — только синхронизация статуса в БД, слот не меняем. */
    if (newStatus === 'refunded') {
      const r = await pgQuery(
        `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
        [newStatus, orderAcquiringID]
      );
      if (r.rowCount === 0) {
        console.warn('yookassa-webhook: нет транзакции для refunded', orderAcquiringID);
      }
      return NextResponse.json({ success: true });
    }

    console.log(`yookassa-webhook: статус ${newStatus} для ${orderAcquiringID}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    return NextResponse.json({ error: 'Ошибка обработки вебхука' }, { status: 500 });
  }
}
