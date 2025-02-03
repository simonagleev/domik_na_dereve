import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
    console.log('PAYMENT STARTED')
    const { amount, description, return_url, phone, itemID, type, info, count } = await request.json();

    // Данные магазина из .env
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const idempotenceKey = `${Date.now()}-${Math.random()}`; // Генерация ключа идемпотентности
    // console.log('YOOKASSA_SHOP_ID:', shopId);
    // console.log('YOOKASSA_SECRET_KEY:', secretKey);
    
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
                receipt: {
                    customer: {
                        phone: phone, // Укажите email покупателя
                    },
                    items: [
                        {
                            description: `Оплата билета в "Домик на дереве"`, // Описание товара
                            quantity: count, // Количество
                            amount: {
                                value: amount, // Стоимость товара
                                currency: 'RUB',
                            },
                            vat_code: 4, // Код НДС (1 = 20%, 2 = 10%, 3 = 0%, 4 = без НДС)
                        },
                    ],
                },
            }),
        });

        const paymentData = await yookassaResponse.json();
        console.log()
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
        const currentTable = type === 'show' ?
            'update_remaining_count' :
            type === 'mk' ?
                'decrease_remaining_count_workshops' :
                'decrease_remaining_count_birthdays'

        // Шаг 3: уменьшение RemainingCount предварительное
        const { data, error: dbError2 } = await supabase
            .rpc(currentTable, {
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
