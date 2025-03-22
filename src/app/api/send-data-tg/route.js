import axios from 'axios';
// import fs from 'fs';

const telegramBotToken = process.env.TG_TOKEN; // ваш токен
// Функция для сохранения chat_id
// const saveChatIds = (chatId) => {
// const filePath = 'chatIds.json';

// Чтение существующих chat_id
// const chatIds = fs.existsSync(filePath)
//   ? JSON.parse(fs.readFileSync(filePath))
//   : [];

const chatIds = [303004588, 426304059, 1945327470]

// Добавление нового chat_id, если его нет в списке
// if (!chatIds.includes(chatId)) {
//   chatIds.push(chatId);
//   fs.writeFileSync(filePath, JSON.stringify(chatIds));
// }
// };

// Функция для получения всех chat_id пользователей
const getChatIds = async () => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${telegramBotToken}/getUpdates`
    );

    // Сохранение chat_id из всех обновлений
    response.data.result.forEach(update => {
      const chatId = update.message.chat.id;
      saveChatIds(chatId);  // Сохраняем chat_id в файл
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
  }
};



export async function POST(request) {
  try {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const data = await request.json();
    let message = null
    console.log(data)
    if (!data.name || !data.phone || !data.date || !data.count || !data.email || !data.orderID || !data.title) {
      return new Response(JSON.stringify({ error: 'Не все данные переданы' }), { status: 400 });
    }
    const messageWorkshop = `
        Новый запрос на запись MK:
      Дата и время: ${data.date.split('T')[0]} в ${data.date.split('T')[1].substring(0, 5)},
        Название: ${data.title}
        Количество: ${data.count}
          Имя: ${data.name}
          Телефон: ${data.phone}
          Email: ${data.email}
            ----------
          orderID: ${data.orderID}
      `;

    const messageShow = `
      ПОКУПКА БИЛЕТА на СПЕКТАКЛЬ:
      Дата и время: ${data.date.split('T')[0]} в ${data.date.split('T')[1].substring(0, 5)},
      Название: ${data.title}
      Количество: ${data.count}
        Имя: ${data.name}
        Телефон: ${data.phone}
        Email: ${data.email}
        ----------
        orderID: ${data.orderID}
    `;

    switch (data.type) {
      case 'show':
        message = messageShow
        break;
      case 'mk':
        message = messageWorkshop
        break;
      default:
        message = `Что-то не так, но кто-то пытался купить билет`

        break;
    }
    for (const chatId of chatIds) {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Ошибка отправки в Telegram:", error);
    return new Response(JSON.stringify({ error: "Ошибка на сервере" }), { status: 500 });
  }
}
