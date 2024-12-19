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

// Функция для отправки сообщения всем пользователям
const sendMessageToAllUsers = async (message) => {
  // const chatIds = JSON.parse(fs.readFileSync('chatIds.json'));

  const chatIds = [303004588, 426304059, 1945327470]
  // Отправляем сообщение всем сохраненным chat_id
  chatIds.forEach(async (chatId) => {
    try {
      await axios.post(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message
        }
      );
      console.log(`Message sent to ${chatId}`);
    } catch (error) {
      console.error(`Error sending message to ${chatId}:`, error);
    }
  });
};

// Основная функция обработки запроса
export async function POST(req) {
  const { type, name, phone, email, date, title, count, orderID } = await req.json();
  console.log(type, name, phone, email, date, title, count, orderID)
  const messageWorkshop = `
    Новый запрос на запись MK:
  Дата и время: ${date.split('T')[0]} в ${date.split('T')[1].substring(0, 5)},
    Название: ${title}
    Количество: ${count}
      Имя: ${name}
      Телефон: ${phone}
      Email: ${email}
        ----------
      orderID: ${orderID}
  `;

  const messageShow = `
  ПОКУПКА БИЛЕТА на СПЕКТАКЛЬ:
  Дата и время: ${date.split('T')[0]} в ${date.split('T')[1].substring(0, 5)},
  Название: ${title}
  Количество: ${count}
    Имя: ${name}
    Телефон: ${phone}
    Email: ${email}
    ----------
    orderID: ${orderID}
`;

  // Получение всех chat_id
  // await getChatIds();

  // Отправка сообщения всем пользователям
  await sendMessageToAllUsers(type === 'show' ? messageShow : type === 'mk' ? messageWorkshop : 'Что-то непредвиденное произошло');

  // Возвращаем успешный ответ
  return new Response(JSON.stringify({ message: 'Data sent to Telegram' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
