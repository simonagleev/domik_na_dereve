export async function POST(request) {
    const telegramBotToken = process.env.TG_TOKEN;
    const chatIds = [303004588, 426304059, 1945327470];

    try {
        const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        let event = null
        const data = await request.json();

        if (!data.name || !data.phone || !data.type) {
            return new Response(JSON.stringify({ error: 'Не все данные переданы' }), { status: 400 });
        }

        switch (data.type) {
            case 'birthday':
                event = 'ДЕНЬ РОЖДЕНИЯ'
                break;
            case 'creative_workshops':
                event = 'ТВОРЧЕСКУЮ МАСТЕРСКУЮ'
                break;
            case 'camp':
                event = 'ЛЕТНИЙ ЛАГЕРЬ'
                break;
            default:
                event = 'Неизвестно (что-то пошло не так)'
                break;
        }

        const message = `Новая заявка на ${event} 
            от ${data.name} 
            тел: ${data.phone}.
            Имя ребенка: ${data.childName ? data.childName : ''}
            Возраст: ${data.childAge ? data.childAge : ''}
            ${data.eventDate ? 'Планируемая дата: ' + data.eventDate : null}`

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
