import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
    console.log('WEBHOOK STARTED')
    try {
        const body = await request.json();

        // Проверка, что запрос пришел от ЮKassa
        const shopId = process.env.YOOKASSA_SHOP_ID;
        const secretKey = process.env.YOOKASSA_SECRET_KEY;
        const signature = request.headers.get('Authorization');

        const expectedSignature = `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;

        const { object, event } = body; // Данные из вебхука
        const { id: orderAcquiringID, status: newStatus } = object;

        if (newStatus === ('canceled' || 'rejected' || 'refunded')) {
            console.log('PAYMENT FAILED')

            const { orderTypeData, error: dbErrorType } = await supabase
                .from('schedule')
                .select('Type')
                .eq('OrderAcquiringID', orderAcquiringID)

            if (dbErrorType) {
                console.log('ОШИБКА получения типа из транзакции')
                console.log(dbErrorType)
                return NextResponse.json({ error: dbErrorType.error }, { status: 500 });
            } else {
                console.log(orderTypeData)
                const orderType = orderTypeData.length > 0 ? orderTypeData[0].Type : null;
                if (orderType && orderType === 'show') {
                    const { data, error: dbError2 } = await supabase
                        .rpc('increase_remaining_count', {
                            order_id: orderAcquiringID,
                        });

                    if (dbError2) {
                        console.log('ОШИБКА обновления RemainingCount в спетаклях')
                        console.log(dbError2)
                        return NextResponse.json({ error: dbError2.error }, { status: 500 });
                    }
                } else if (orderType && orderType === 'mk') {
                    const { data, error: dbError2 } = await supabase
                        .rpc('increase_workshops_remaining_count', {
                            order_id: orderAcquiringID,
                        });

                    if (dbError2) {
                        console.log('ОШИБКА обновления RemainingCount в мастер-классах')
                        console.log(dbError2)
                        return NextResponse.json({ error: dbError2.error }, { status: 500 });
                    }
                }
            }


        } else if (newStatus === 'succeeded') {
            console.log('PAYMENT SUCCESS')
            // Обновление статуса платежа в Supabase
            const { error } = await supabase
                .from('onlineTransactions')
                .update({ Status: newStatus })
                .eq('OrderAcquiringID', orderAcquiringID);

            if (error) {
                console.error('Ошибка обновления статуса в Supabase:', error);
                return NextResponse.json({ error: 'Ошибка обновления статуса' }, { status: 500 });
            }
        } else {
            console.log(`SOMETHING STRANGE HAPPENED TO THE PATMENT ${orderAcquiringID}`)
        }


        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка обработки вебхука:', error);
        return NextResponse.json({ error: 'Ошибка обработки вебхука' }, { status: 500 });
    }
}
