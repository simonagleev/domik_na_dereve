'use client'
import { useEffect, useState } from "react";
import CwCard from "../card/card";
import Loader from "@/components/Loader/Loader";
import styles from "./cards.module.css";

export default function CwCards() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const response = await fetch('/api/get-creative-workshops');
                const data = await response.json();

                if (cancelled) return;

                if (response.ok && Array.isArray(data)) {
                    setCards(data);
                    setError(null);
                } else {
                    setError(data?.error || 'Не удалось загрузить мастерские');
                }
            } catch {
                if (!cancelled) {
                    setError('Ошибка при загрузке творческих мастерских');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className={styles.CwCards} >
            <h2 className={styles.CwCards_heading}>
                Наши творческие мастерские
            </h2>
            {loading ? <Loader /> : null}
            {error ? <p className={styles.CwCards_heading} style={{ fontSize: '1.25rem' }}>{error}</p> : null}
            <div className={styles.CwCards_container}>
                {cards.map((e) => {
                    return <CwCard data={e} key={e.id ?? e.name} />
                })}
            </div>
        </div>
    );
}
