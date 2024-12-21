import { supabase } from '../../../../lib/supabase';

export async function GET(req) {
  try {
    // Получаем все данные из таблицы 'schedule'
    const now = new Date();
    const irkutskOffset = 8 * 60; // Разница UTC+8 в минутах
    // Текущее время в Иркутске
    const irkutskTime = new Date(now.getTime() + irkutskOffset * 60 * 1000);
    // Прибавляем 1 час
    irkutskTime.setHours(irkutskTime.getHours() + 1);

    // Преобразуем время в строку в формате 'YYYY-MM-DD HH:MM:SS'
    const oneHourLater = irkutskTime.toISOString().replace('T', ' ').slice(0, 19);

    const { data, error } = await supabase
      .from('schedule') // Название вашей таблицы
      .select('*') // Получаем все поля
      .gt('StartDateTime', oneHourLater) // Сравниваем с текущим временем + 1 час
      .order('StartDateTime', { ascending: true });

    // Проверка на ошибки
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Возвращаем успешный ответ с данными
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
