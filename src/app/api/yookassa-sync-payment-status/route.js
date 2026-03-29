import { NextResponse } from 'next/server';
import { syncOnlineTransactionWithYooKassa } from '@/lib/yookassaSyncPaymentStatus';

/**
 * Резервное обновление статуса после возврата с оплаты (если HTTP-уведомление YooKassa не дошло).
 * POST JSON: { paymentId: string }
 */
export async function POST(request) {
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
    return NextResponse.json(
      { error: result.error },
      { status: status === 404 ? 404 : status }
    );
  }

  return NextResponse.json({
    ok: true,
    status: result.ykStatus,
    updated: result.updated,
    previousDbStatus: result.previousDbStatus,
  });
}
