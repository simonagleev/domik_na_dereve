import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
    console.log('PAYMENT STARTED')
    const { amount, description, return_url, phone, itemID, type, info, count } = await request.json();

    // Данные магазина из .env


    const idempotenceKey = `${Date.now()}-${Math.random()}`; // Генерация ключа идемпотентности

    console.log('PROPS')
    console.log(`Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`)
    console.log(new Date().toLocaleString())

    try {
        // Шаг 1: Запрос к ЮKassa
        const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotenceKey,
                Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
            },
            body: JSON.stringify({
                amount: {
                    value: amount, // Сумма платежа
                    currency: 'RUB',
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url, // URL возврата после успешной оплаты
                },
                description,
            }),
        });

        const paymentData = await yookassaResponse.json();

        if (!yookassaResponse.ok) {
            console.log('yookassa RESPONSE NOT OK')
            return NextResponse.json({ error: paymentData }, { status: yookassaResponse.status });
        }

        const orderId = paymentData.id; // ID платежа из ЮKassa
        const confirmationUrl = paymentData.confirmation.confirmation_url;
        const orderStatus = paymentData.status
        
        // Шаг 2: Запись в Supabase
        const { error: dbError } = await supabase.from('onlineTransactions').insert([
            {
                OrderAcquiringID: orderId,
                Status: orderStatus,  //Тут должно быть 'pending'
                Date: new Date().toISOString(),
                Amount: amount,
                Type: type,
                Phone: phone,
                ItemID: itemID,
                TicketCount: count,
                Info: info ? info : '',
            },
        ]);

        if (dbError) {
            console.error('Ошибка записи в Supabase:', dbError);
            return NextResponse.json({ error: 'Ошибка записи в базу данных' }, { status: 500 });
        }

        // Шаг 3: уменьшение RemainingCount предварительное
        const { data, error: dbError2 } = await supabase
        .rpc('update_remaining_count', {
          item_id: itemID,
          count: count,
        });
        
        if (dbError2) {
            console.log('ОШИБКА обновления RemainingCount')
            console.log(dbError2)
            return NextResponse.json({ error: dbError2.error }, { status: 500 });
        }

        // Шаг 4: Возвращение ссылки на оплату
        return NextResponse.json({ confirmationUrl });
    } catch (error) {
        console.error('Ошибка создания платежа:', error);
        return NextResponse.json({ error: 'Ошибка при запросе к ЮKassa' }, { status: 500 });
    }
}
