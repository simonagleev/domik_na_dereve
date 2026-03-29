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

    if (newStatus === 'canceled') {
      await applyCanceledPaymentAndRestoreSeats(orderAcquiringID);
    }

    const r = await pgQuery(
      `UPDATE online_transactions SET status = $1 WHERE order_acquiring_id = $2`,
      [newStatus, orderAcquiringID]
    );
    if (r.rowCount === 0) {
      console.warn(
        'yookassa-webhook: нет строки online_transactions для статуса',
        newStatus,
        orderAcquiringID
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    return NextResponse.json({ error: 'Ошибка обработки вебхука' }, { status: 500 });
  }
}
