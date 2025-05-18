import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
    try {
        const data = await request.json();
        if (!data.name || !data.phone || !data.type) {
            return new Response(JSON.stringify({ error: 'Не все данные переданы' }), { status: 400 });
        }

        // Вставляем данные в таблицу feedbackRequests
        const { error: dbError } = await supabase.from('feedbackRequests').insert([
            {
                Name: data.name,
                Phone: data.phone,
                Type: data.type,
                ChildName: data.childName,
                ChildAge: data.childAge ? Number(data.childAge) : null,
                EventDate: data.eventDate ? data.eventDate : null,
            },
        ]);

        // Проверка на ошибки при вставке в базу данных
        if (dbError) {
            console.error('Ошибка записи в Supabase:', dbError);
            return Response.json({ error: 'Ошибка записи в базу данных' }, { status: 500 });
        }
        return new Response(JSON.stringify({ success: true, received: data }), { status: 200 });
    } catch (error) {
        console.error('Ошибка обработки запроса:', error);
        return new Response(JSON.stringify({ error: 'Произошла ошибка при обработке запроса' }), { status: 500 });
    }
}



