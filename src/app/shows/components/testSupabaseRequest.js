'use client'
// src/app/workshops/page.js
import { useEffect, useState } from 'react';

export default function WorkshopsPage() {
    const [schedule, setSchedule] = useState([]);
    const [error, setError] = useState(null);

    
    useEffect(() => {
        console.log('ЗАПРОС НАЧАЛСЯ')
        // Запрос к API маршруту для получения данных
        const fetchData = async () => {
            try {
                const response = await fetch('/api/showsSchedule');
                const data = await response.json();

                if (response.ok) {
                    console.log('RESPONSE OK')
                    console.log(data)
                    setSchedule(data);
                } else {
                    console.log('RESPONSE ERROR')

                    setError(data.error);
                }
            } catch (error) {
                setError('Ошибка при загрузке данных');
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div>
            <h1>Мастер-классы</h1>
            <ul>
                {schedule.map((item) => (
                    <li key={item.id}>
                        <strong>{item.show_id}</strong>: {item.startdatetime} - {item.price} руб. (Осталось {item.remainingcount} мест)
                    </li>
                ))}
            </ul>
        </div>
    );
}
