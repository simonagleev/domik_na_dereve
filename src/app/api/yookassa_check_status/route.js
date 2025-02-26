import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export default function checkStatusYookassa(object, attempt = 0) {

    return new Promise(function (resolve, reject) {
        console.log('getOrderStatus YOOKASSA HAPPENED');

        const shopId = process.env.YOOKASSA_SHOP_ID_TEST;
        const secretKey = process.env.YOOKASSA_SECRET_KEY_TEST;
    
        const idempotenceKey = `${Date.now()}-${Math.random()}`; // Генерация ключа идемпотентности
        const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

        var options = {
            method: 'GET',
            url: `https://api.yookassa.ru/v3/payments/${object.orderId}`,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey,
            },
            json: true
        };

        const delays = [60000, 60000, 120000, 302000]; // 5 мин, 10 мин

        const makeRequest = () => {
            request(options, function (error, response, body) {
                console.log('body');
                console.log(body);

                if (error) {
                    console.log('error request', error);
                    reject(error);
                    return;
                }

                if (typeof body !== 'object') {
                    console.log('error request wrong type of body');
                    reject(body.errorMessage);
                    return;
                }

                if (body.status === 'pending' && attempt < delays.length) {
                    const delay = delays[attempt]; // Получаем задержку для текущей попытки
                    console.log(`Status is pending. Retrying in ${delay / 1000} seconds...`);
                    setTimeout(() => {
                        getOrderStatusYookassa(object, attempt + 1).then(resolve, reject);
                    }, delay);
                } else {
                    // Если статус не 'pending' или попытки закончились, завершаем процесс
                    resolve(body);
                }
            });
        };

        // Выполняем первый запрос заново
        makeRequest();
    });
}