// src/app/api/schedule/route.js
import { supabase } from '../../../../../lib/supabase';
export async function GET(req) {

  try {
    // Получаем все данные из таблицы 'schedule'
    const { data, error } = await supabase
      .from('onlineTransactions') // Название вашей таблицы
      .select('*') // Получаем все поля
      .order('ID', { ascending: false });
      
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
