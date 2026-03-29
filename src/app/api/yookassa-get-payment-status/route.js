import { NextResponse } from 'next/server';
import { getYooKassaCredentials } from '@/lib/yookassaCredentials';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  const { shopId, secretKey } = getYooKassaCredentials();
  if (!shopId || !secretKey || !orderId) {
    return NextResponse.json({ error: 'Нет параметров или ключей YooKassa' }, { status: 400 });
  }

  const response = await fetch(`https://api.yookassa.ru/v3/payments/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Ошибка получения статуса' }, { status: 500 });
  }

  const paymentData = await response.json();

  /*
   * [СТАРАЯ БД SUPABASE] Раньше здесь обновляли onlineTransactions в Supabase.
   * Актуальное обновление статуса в Postgres — через /api/yookassa-webhook и
   * syncOnlineTransactionWithYooKassa (yookassa-sync-payment-status, админ «Проверить оплату»).
   *
   * const { error } = await supabase
   *     .from('onlineTransactions')
   *     .update({ Status: paymentData.status })
   *     .eq('OrderAcquiringID', paymentData.id);
   *
   * if (paymentData.status === 'canceled' || ...) {
   *     await supabase.rpc('increase_remaining_count', { order_id: paymentData.id });
   * }
   */

  return NextResponse.json({ status: paymentData.status });
}
