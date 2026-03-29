import { NextResponse } from 'next/server';
import { withTransaction, pgQuery } from '@/lib/postgres';
import { getYooKassaCredentials } from '@/lib/yookassaCredentials';
import { isCommentMarkedTest, shouldIncludeTestScheduleSlots } from '@/lib/scheduleTestSlots';

async function insertOnlineTransactionPg(client, payload) {
  const {
    orderId,
    orderStatus,
    phone,
    amount,
    type,
    itemID,
    ticketCount,
    info,
    child_name,
    client_name,
  } = payload;

  await client.query(
    `
    INSERT INTO online_transactions (
      order_acquiring_id,
      phone,
      status,
      "date",
      amount,
      "type",
      item_id,
      info,
      ticket_count,
      child_name,
      client_name
    )
    VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      orderId,
      phone,
      orderStatus,
      amount,
      type,
      itemID,
      info != null ? String(info) : '',
      ticketCount,
      child_name != null && String(child_name).trim() !== '' ? String(child_name).trim() : null,
      client_name != null && String(client_name).trim() !== '' ? String(client_name).trim() : null,
    ]
  );
}

async function decreaseScheduleRemainingPg(client, type, itemID, count) {
  if (type === 'show') {
    const r = await client.query(
      `
      UPDATE shows_schedule
      SET remaining_count = remaining_count - $1
      WHERE id = $2 AND remaining_count >= $1
      RETURNING id
      `,
      [count, itemID]
    );
    return r.rowCount > 0;
  }
  if (type === 'workshop') {
    const r = await client.query(
      `
      UPDATE workshop_schedule
      SET remaining_count = remaining_count - $1
      WHERE id = $2 AND remaining_count >= $1
      RETURNING id
      `,
      [count, itemID]
    );
    return r.rowCount > 0;
  }
  return false;
}

export async function POST(request) {
  const body = await request.json();
  const {
    amount,
    description,
    return_url,
    phone,
    itemID,
    type,
    info,
    count,
    child_name,
    client_name,
  } = body;

  if (type !== 'show' && type !== 'workshop') {
    return NextResponse.json(
      {
        error:
          'Этот тип оплаты не поддерживается. Спектакли и мастер-классы — через type show или workshop.',
      },
      { status: 400 }
    );
  }

  const countNum = Number(count);
  if (!Number.isFinite(countNum) || countNum < 1) {
    return NextResponse.json({ error: 'Некорректное количество билетов' }, { status: 400 });
  }

  if (!shouldIncludeTestScheduleSlots(request)) {
    const slotId = Number(itemID);
    if (Number.isNaN(slotId)) {
      return NextResponse.json({ error: 'Некорректный слот расписания' }, { status: 400 });
    }
    const slotSql =
      type === 'show'
        ? `SELECT comments FROM shows_schedule WHERE id = $1`
        : `SELECT comments FROM workshop_schedule WHERE id = $1`;
    const { rows: slotRows } = await pgQuery(slotSql, [slotId]);
    const slotComment = slotRows[0]?.comments;
    if (isCommentMarkedTest(slotComment)) {
      return NextResponse.json(
        { error: 'Этот слот недоступен для покупки.' },
        { status: 403 }
      );
    }
  }

  const { shopId, secretKey, isTest } = getYooKassaCredentials();
  if (!shopId || !secretKey) {
    return NextResponse.json(
      { error: 'Платёжная система не настроена (YooKassa).' },
      { status: 500 }
    );
  }

  if (isTest) {
    console.log('[create-payment] YooKassa: тестовый магазин');
  }

  const infoForDb = isTest
    ? 'Test API'
    : info != null && String(info).trim() !== ''
      ? String(info).trim()
      : '';

  const idempotenceKey = `${Date.now()}-${Math.random()}`;

  try {
    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: {
          value: String(Number(amount).toFixed(2)),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url,
        },
        description,
        receipt: {
          customer: {
            phone: phone,
          },
          items: [
            {
              description: `Оплата билета в "Домик на дереве"`,
              quantity: countNum,
              amount: {
                value: (amount / countNum).toFixed(2),
                currency: 'RUB',
              },
              vat_code: 1,
            },
          ],
        },
      }),
    });

    const paymentData = await yookassaResponse.json();

    if (!yookassaResponse.ok) {
      console.log('yookassa RESPONSE NOT OK');
      console.log('Status:', yookassaResponse.status);
      console.log('Response body:', paymentData);
      return NextResponse.json({ error: paymentData }, { status: yookassaResponse.status });
    }

    const orderId = paymentData.id; // ID платежа из ЮKassa
    const confirmationUrl = paymentData.confirmation.confirmation_url;
    const orderStatus = paymentData.status;

    /*
     * [СТАРАЯ БД SUPABASE] Для других type раньше писали в onlineTransactions и вызывали
     * decrease_remaining_count_birthdays — перенесено на отказ: поддерживаются только show/workshop (см. проверку выше).
     */
    try {
      // Одна транзакция: запись платежа + списание мест. Если UPDATE не прошёл (нет билетов) — ROLLBACK и INSERT тоже откатится.
      await withTransaction(async (client) => {
        await insertOnlineTransactionPg(client, {
          orderId,
          orderStatus,
          phone,
          amount,
          type,
          itemID,
          ticketCount: countNum,
          info: infoForDb,
          child_name,
          client_name,
        });

        const ok = await decreaseScheduleRemainingPg(client, type, itemID, countNum);
        if (!ok) {
          throw Object.assign(new Error('NO_TICKETS'), { code: 'NO_TICKETS' });
        }
      });
    } catch (e) {
      if (e?.code === 'NO_TICKETS') {
        return NextResponse.json(
          { error: 'Недостаточно билетов на выбранную дату' },
          { status: 409 }
        );
      }
      console.error('create-payment PG transaction', e);
      return NextResponse.json(
        { error: e?.message || 'Ошибка записи в базу данных' },
        { status: 500 }
      );
    }

    return NextResponse.json({ confirmationUrl, paymentId: orderId });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return NextResponse.json({ error: 'Ошибка при запросе к ЮKassa' }, { status: 500 });
  }
}
