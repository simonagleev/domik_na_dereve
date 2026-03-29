/**
 * [СТАРАЯ БД SUPABASE / LEGACY] Раньше здесь был вспомогательный опрос статуса YooKassa через `request`
 * и задержки; обновление шло в Supabase. Не используется — актуально:
 * lib/yookassaSyncPaymentStatus.js, /api/yookassa-get-payment-status, /api/yookassa-sync-payment-status.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error:
        'Эндпоинт не используется. Для статуса платежа см. /api/yookassa-get-payment-status?orderId=…',
    },
    { status: 410 }
  );
}
