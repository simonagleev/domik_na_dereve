import { NextResponse } from 'next/server';
import { getAdminPayload } from '@/lib/adminAuth';
import { syncOnlineTransactionWithYooKassa } from '@/lib/yookassaSyncPaymentStatus';

/**
 * POST JSON: { paymentId: string } — order_acquiring_id платежа YooKassa.
 * Только для админки: сверка статуса с API YooKassa и обновление online_transactions при расхождении.
 */
export async function POST(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const paymentId = body?.paymentId;
  if (!paymentId || typeof paymentId !== 'string') {
    return NextResponse.json({ error: 'Нужен paymentId' }, { status: 400 });
  }

  const result = await syncOnlineTransactionWithYooKassa(paymentId);

  if (!result.ok) {
    const status = result.status ?? 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    previousDbStatus: result.previousDbStatus,
    ykStatus: result.ykStatus,
    updated: result.updated,
  });
}
