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

        console.log(`РЕКЕСТ: ${request}`);
        const expectedSignature = `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;
        console.log(`Expected signature: ${expectedSignature}`);
        
        // if (!signature || signature !== expectedSignature) {
        //     console.error('Authorization failed');
        //     return NextResponse.json({ error: 'Unauthorized вебхук' }, { status: 401 });
        // }

        const { object, event } = body; // Данные из вебхука
        const { id: orderAcquiringID, status: newStatus } = object;
 
        // Обновление статуса платежа в Supabase
        const { error } = await supabase
            .from('onlineTransactions')
            .update({ Status: newStatus })
            .eq('OrderAcquiringID', orderAcquiringID);

        if (error) {
            console.error('Ошибка обновления статуса в Supabase:', error);
            return NextResponse.json({ error: 'Ошибка обновления статуса' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка обработки вебхука:', error);
        return NextResponse.json({ error: 'Ошибка обработки вебхука' }, { status: 500 });
    }
}
