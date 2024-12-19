import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
// Это тестовое тест
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

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
    
    const { error } = await supabase
        .from('onlineTransactions')
        .update({ Status: paymentData.status })
        .eq('OrderAcquiringID', paymentData.id);

    if (error) {
        console.error('Ошибка обновления статуса в Supabase:', error);
        return NextResponse.json({ error: 'Ошибка обновления статуса' }, { status: 500 });
    }

    // Если не прошла оплата, то возвращаем количество оставшихся билетов как было до оплаты.
    if (paymentData.status === ('canceled' || 'rejected' || 'refunded')) {
        const { data, error: dbError2 } = await supabase
            .rpc('increase_remaining_count', {
                order_id: paymentData.id,
            });

        if (dbError2) {
            console.log('ОШИБКА обновления RemainingCount')
            console.log(dbError2)
            return NextResponse.json({ error: dbError2.error }, { status: 500 });
        }
    }
    return NextResponse.json({ status: paymentData.status });
}
