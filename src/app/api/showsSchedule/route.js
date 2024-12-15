// src/app/api/schedule/route.js
import { supabase } from '../../../../lib/supabase';
export async function GET(req) {
  console.log('GET STARTED')
  try {
    // Получаем все данные из таблицы 'schedule'
    const { data, error } = await supabase
      .from('schedule') // Название вашей таблицы
      .select('*'); // Получаем все поля

    // Проверка на ошибки
    if (error) {
      console.log('FAIL')
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    console.log('DATA')
    console.log(data)
    // Возвращаем успешный ответ с данными
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log('CATCH')
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
