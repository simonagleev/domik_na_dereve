import axios from 'axios';
import fs from 'fs';

const telegramBotToken = '8194525050:AAHauaq2b2WLYM3YOc4StgS0bWRke4GR1wo'; // ваш токен

// Функция для сохранения chat_id
const saveChatIds = (chatId) => {
  const filePath = 'chatIds.json';

  // Чтение существующих chat_id
  const chatIds = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];

  // Добавление нового chat_id, если его нет в списке
  if (!chatIds.includes(chatId)) {
    chatIds.push(chatId);
    fs.writeFileSync(filePath, JSON.stringify(chatIds));
  }
};

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
  const chatIds = JSON.parse(fs.readFileSync('chatIds.json'));

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
  const { name, phone, email, date, time, title } = await req.json();
  console.log(date)
  console.log(time)
  console.log(title)
  const message = `
    Новый запрос на запись 
    Дата и время: ${date} в ${time}:
    Название: ${title}
      Имя: ${name}
      Телефон: ${phone}
      Email: ${email}
  `;

  // Получение всех chat_id
  await getChatIds();

  // Отправка сообщения всем пользователям
  await sendMessageToAllUsers(message);

  // Возвращаем успешный ответ
  return new Response(JSON.stringify({ message: 'Data sent to Telegram' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
