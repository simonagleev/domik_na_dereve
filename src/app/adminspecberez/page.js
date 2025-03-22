'use client'
import { useState, useEffect } from "react";

export default function AdminPage() {
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        try {
            fetch('/api/admin/get-all-online-transactions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    setTransactions(data.slice(0, 20))
                })
                .catch(error => console.error('Ошибка:', error));
        } catch (error) {
            console.error('Ошибка при отправке данных (ТГ):', error);
        }
    }, [])

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    return (
        <div style={{width: '100%'}}>
            {transactions.map(e => {
                return (
                    <div style={{fontSize: '.8em', display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', gap:"10px", border: '1px solid green' }} key={e.ID}>
                        <div>{e.ID}</div>
                        {/* <div >
                            <p >{formatDate(e.Date.split('T')[0])}</p>
                        </div>
                        <div>
                            <p >{e.Date.split('T')[1].substring(0, 5)}</p>
                        </div> */}
                        <div style={{borderLeft: '1px solid green', paddingLeft: '5px'}}>{e.Phone}</div>
                        <div style={{borderLeft: '1px solid green', borderRight: '1px solid green', padding: '3px 5px'}}>{e.OrderAcquiringID}</div>
                        <div>{e.Type}</div>
                    </div>)
            })}
        </div>
    );
}